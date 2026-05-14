import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import SidebarRight from '../../components/Sidebar-right/SidebarRight';
import WeatherCard from '../../components/WeatherCard/WeatherCard';
import TutorialOverlay from '../../components/Tutorial/TutorialOverlay';
import LetterPopup from '../../components/LetterPopup/LetterPopup';
import mascotImg from '@/assets/mascot-removebg-preview.png';
import { getDiaryList } from '@/services/diaryApi';
import { getStats } from '@/services/statsApi';
import { getLetters } from '@/services/letterApi';
import { getMyCharacter } from '@/services/characterApi';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import CharacterGreetingPopup from '@/components/CharacterGreeting/CharacterGreetingPopup';
import StampCalendar from '@/components/StampCalendar/StampCalendar';
import StampCelebration from '@/components/StampCalendar/StampCelebration';
import "@/styles/Home/Home.css";

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const EMOTION_COLOR = {
  '행복': '#FFD93D', '기쁨': '#FF6B6B', '평온': '#6BCB77',
  '슬픔': '#4D96FF', '우울': '#845EC2', '불안': '#F9A826',
  '분노': '#FF4D4D', '놀람': '#FF9F43', '두려움': '#8B5CF6',
  '혐오': '#A0A0A0', '수치': '#EC4899', '설렘': '#FF6B9D',
  '외로움': '#74B9FF', '뿌듯함': '#00B894', '지루함': '#B2BEC3', '감사': '#FDCB6E',
};

const STATUS_LABEL = {
  COMPLETED: '✦ 분석완료',
  ANALYZING: '⏳ 분석중',
  PENDING:   '⏳ 대기중',
  FAILED:    '⚠ 실패',
};

const QUICK_EMOTIONS = [
  { label: '행복', emoji: '😊', color: '#FFD93D' },
  { label: '평온', emoji: '😌', color: '#6BCB77' },
  { label: '슬픔', emoji: '😢', color: '#4D96FF' },
  { label: '불안', emoji: '😰', color: '#F9A826' },
  { label: '분노', emoji: '😤', color: '#FF4D4D' },
  { label: '설렘', emoji: '🤩', color: '#FF6B9D' },
];

const formatDate = (dateStr) => dateStr?.replace(/-/g, '.') ?? '';

function getGreeting(name) {
  const h = new Date().getHours();
  if (h < 6)  return { msg: `잘 주무셨나요, ${name}님`, emoji: '🌙' };
  if (h < 12) return { msg: `좋은 아침이에요, ${name}님`, emoji: '☀️' };
  if (h < 18) return { msg: `좋은 오후예요, ${name}님`, emoji: '🌤️' };
  return { msg: `오늘 하루도 수고했어요, ${name}님`, emoji: '🌙' };
}

function DonutChart({ data }) {
  const r = 52, cx = 70, cy = 70;
  const circumference = 2 * Math.PI * r;

  if (!data?.length) {
    return (
      <svg viewBox="0 0 140 140" className="donut-svg">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0ECE8" strokeWidth="20" />
        <circle cx={cx} cy={cy} r={41} fill="white" />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill="#C0B4A4">기록 없음</text>
      </svg>
    );
  }

  let cumulative = 0;
  const segments = data.slice(0, 6).map(d => {
    const start = cumulative;
    cumulative += d.percentage;
    return {
      ...d,
      dashLength: (d.percentage / 100) * circumference,
      startOffset: (start / 100) * circumference,
      color: EMOTION_COLOR[d.emotion] ?? '#D4C8B8',
    };
  });

  const top = data[0];

  return (
    <svg viewBox="0 0 140 140" className="donut-svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0ECE8" strokeWidth="20" />
      <g style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}>
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="20"
            strokeLinecap="butt"
            strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
            strokeDashoffset={-seg.startOffset}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={41} fill="white" />
      {top && (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="15" fontWeight="800" fill="#1A1410">{top.emotion}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="13" fontWeight="600" fill={EMOTION_COLOR[top.emotion] ?? '#A89880'}>{top.percentage}%</text>
        </>
      )}
    </svg>
  );
}

function WeekTracker({ diaries }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 6 + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    const hasEntry = diaries.some(diary => diary.diaryDate === dateStr);
    const isToday = i === 6;
    const weekDay = WEEK_DAYS[(d.getDay() + 6) % 7];
    return { dateStr, hasEntry, isToday, weekDay, dayNum: day };
  });

  return (
    <div className="week-tracker card">
      <div className="section-head">
        <span className="section-title">최근 7일 기록</span>
        <span className="section-badge">이번 주</span>
      </div>
      <div className="week-tracker-dots">
        {days.map(({ dateStr, hasEntry, isToday, weekDay, dayNum }) => (
          <div key={dateStr} className={`wt-day ${isToday ? 'wt-today' : ''}`}>
            <span className="wt-label">{weekDay}</span>
            <div className={`wt-dot ${hasEntry ? 'wt-dot-filled' : 'wt-dot-empty'} ${isToday ? 'wt-dot-today' : ''}`}>
              {hasEntry && <span className="wt-check">✓</span>}
            </div>
            <span className="wt-num">{parseInt(dayNum)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const sec  = time.getSeconds();
  const min  = time.getMinutes();
  const hour = time.getHours() % 12;

  const secDeg  = sec  * 6;
  const minDeg  = min  * 6  + sec  * 0.1;
  const hourDeg = hour * 30 + min  * 0.5;

  const hand = (deg, len, width, color) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return <line x1="50" y1="50"
      x2={50 + len * Math.cos(rad)} y2={50 + len * Math.sin(rad)}
      stroke={color} strokeWidth={width} strokeLinecap="round" />;
  };

  return (
    <svg className="analog-clock" viewBox="0 0 100 100">
      {/* 시계판 */}
      <circle cx="50" cy="50" r="46" fill="#fff8f4" stroke="#f26a21" strokeWidth="3.5" />

      {/* 시간 눈금 */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const r1 = 39, r2 = 43;
        return <line key={i}
          x1={50 + r1 * Math.cos(a)} y1={50 + r1 * Math.sin(a)}
          x2={50 + r2 * Math.cos(a)} y2={50 + r2 * Math.sin(a)}
          stroke="#f2c4a0" strokeWidth="1.8" strokeLinecap="round" />;
      })}

      {/* 분 눈금 */}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null;
        const a = (i * 6 - 90) * (Math.PI / 180);
        return <line key={i}
          x1={50 + 41 * Math.cos(a)} y1={50 + 41 * Math.sin(a)}
          x2={50 + 43 * Math.cos(a)} y2={50 + 43 * Math.sin(a)}
          stroke="#f2c4a0" strokeWidth="0.8" strokeLinecap="round" />;
      })}

      {/* 시침 */}
      {hand(hourDeg, 24, 3.2, '#3D2B1F')}
      {/* 분침 */}
      {hand(minDeg,  33, 2.2, '#5C3D2E')}
      {/* 초침 */}
      {hand(secDeg,  36, 1.2, '#f26a21')}
      {/* 초침 꼬리 */}
      {hand(secDeg + 180, 10, 1.2, '#f26a21')}

      {/* 중심 점 */}
      <circle cx="50" cy="50" r="3"   fill="#f26a21" />
      <circle cx="50" cy="50" r="1.4" fill="#fff8f4" />
    </svg>
  );
}

function QuickCheckIn({ todayHasEntry, navigate }) {
  return (
    <div className="quick-checkin card">
      <div className="section-head">
        <span className="section-title">오늘 기분이 어때요?</span>
      </div>
      {todayHasEntry ? (
        <div className="checkin-done">
          <span className="checkin-done-icon">✓</span>
          <span className="checkin-done-text">오늘 일기를 이미 작성했어요</span>
        </div>
      ) : (
        <>
          <div className="checkin-emotions">
            {QUICK_EMOTIONS.map(({ label, emoji, color }) => (
              <button
                key={label}
                className="checkin-btn"
                style={{ '--checkin-color': color }}
                onClick={() => navigate(`/write?emotion=${encodeURIComponent(label)}`)}
              >
                <span className="checkin-emoji">{emoji}</span>
                <span className="checkin-label">{label}</span>
              </button>
            ))}
          </div>
          <div className="checkin-divider">
            <span>감정이 잘 모르겠다면</span>
          </div>
          <button className="checkin-ai-btn" onClick={() => navigate('/ai-chat')}>
            <span className="checkin-ai-icon">🤖</span>
            <div className="checkin-ai-text">
              <span className="checkin-ai-title">AI와 대화하며 감정 찾기</span>
              <span className="checkin-ai-sub">대화를 통해 오늘의 감정을 파악해드릴게요</span>
            </div>
            <span className="checkin-ai-arrow">→</span>
          </button>
        </>
      )}
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const dayOfWeek = DAYS[now.getDay()];
  const monthStr = `${year}-${month}`;
  const todayStr = `${year}-${month}-${day}`;

  const [diaries, setDiaries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchType,  setSearchType]  = useState('제목');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats]         = useState(null);
  const [showTutorial, setShowTutorial]       = useState(false);
  const [showLetterPopup, setShowLetterPopup] = useState(false);
  const [showGreeting, setShowGreeting]         = useState(false);
  const [showStampCelebration, setShowStampCelebration] = useState(false);
  const [greetingDaysSince, setGreetingDaysSince] = useState(0);
  const [character, setCharacter]               = useState(null);
  const [characterName, setCharacterName]       = useState(null);
  const [unreadLetterId, setUnreadLetterId]     = useState(null);
  const [letters, setLetters]                   = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    if (!localStorage.getItem(`emolens_tutorial_done_${user.id}`)) setShowTutorial(true);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || showTutorial) return;
    getMyCharacter()
      .then(c => setCharacter(c))
      .catch(err => {
        if (err.response?.status === 404) navigate('/character?next=/home');
      });
  }, [user?.id, showTutorial]); // eslint-disable-line react-hooks/exhaustive-deps

  // 팝업 조건: (저녁 6~11시 OR 3일+ 미작성) + 오늘 미작성 + 하루 1회
  useEffect(() => {
    if (loading || !user?.id || showTutorial || !character) return;

    const checkGreeting = () => {
      const greetKey = `emolens_greeting_${user.id}_${year}-${month}-${day}`;
      if (localStorage.getItem(greetKey)) return;
      if (diaries.some(d => d.diaryDate === todayStr)) return;

      const hour = new Date().getHours();
      const sorted = [...diaries].sort((a, b) => b.diaryDate.localeCompare(a.diaryDate));
      const daysSince = sorted[0]
        ? Math.floor((Date.now() - new Date(sorted[0].diaryDate).getTime()) / 86400000)
        : 999;

      if (hour >= 18 && hour <= 23 || daysSince >= 3) {
        localStorage.setItem(greetKey, '1');
        setGreetingDaysSince(daysSince);
        setShowGreeting(true);
      }
    };

    // 최초 실행
    checkGreeting();

    // 노트북 열거나 탭 복귀 시 재체크
    const onVisible = () => { if (document.visibilityState === 'visible') checkGreeting(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loading, user?.id, diaries, showTutorial, character]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.id || showTutorial) return;
    const sessionKey = `emolens_letter_popup_${user.id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    Promise.all([getLetters(), getMyCharacter().catch(() => null)])
      .then(([letters, char]) => {
        setLetters(letters);
        const unread = letters.find(l => !l.isRead);
        if (!unread) return;
        setUnreadLetterId(unread.id);
        setCharacterName(char?.name ?? null);
        setShowLetterPopup(true);
        sessionStorage.setItem(sessionKey, 'true');
      }).catch(() => {});
  }, [user?.id, showTutorial]);

  useEffect(() => {
    if (!user?.id) return;
    getDiaryList(0, 50)
      .then(data => {
        const list = data.content ?? [];
        setDiaries(list);
        const celebKey = `emolens_stamp_celebrated_${user.id}_${todayStr}`;
        const hasTodayEntry = list.some(d => d.diaryDate === todayStr);
        if (hasTodayEntry && !localStorage.getItem(celebKey)) {
          localStorage.setItem(celebKey, '1');
          setTimeout(() => setShowStampCelebration(true), 700);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getStats(monthStr).then(setStats).catch(() => {});
  }, [monthStr]);

  const filtered = diaries.filter(d => {
    if (!searchQuery) return true;
    if (searchType === '제목') return d.title.includes(searchQuery);
    if (searchType === '날짜') return formatDate(d.diaryDate).includes(searchQuery);
    return true;
  });

  const streak      = stats?.summary?.streak ?? 0;
  const emotionDist = stats?.emotionDistribution ?? [];
  const keywords    = stats?.keywords ?? [];
  const aiSummary   = stats?.aiInsights?.summary ?? null;
  const todayHasEntry = diaries.some(d => d.diaryDate === todayStr);
  const greeting = getGreeting(user?.name ?? '');

  return (
    <div className="home-layout">
      {showTutorial && <TutorialOverlay userId={user?.id} onDone={() => setShowTutorial(false)} />}
      {showLetterPopup && (
        <LetterPopup characterName={characterName} letterId={unreadLetterId} onClose={() => setShowLetterPopup(false)} />
      )}
      {showGreeting && !showLetterPopup && (
        <CharacterGreetingPopup
          characterName={character?.name}
          daysSinceLast={greetingDaysSince}
          onClose={() => setShowGreeting(false)}
        />
      )}
      {showStampCelebration && (
        <StampCelebration onDone={() => setShowStampCelebration(false)} />
      )}

      <SidebarLeft />

      <main className="main-content">

        {/* ① Hero */}
        <div className="home-hero card">
          <div className="hero-left">
            <div className="hero-greeting">{greeting.emoji} {greeting.msg}</div>
            <div className="hero-date-wrap">
              <span className="hero-date-num">{parseInt(month)}월 {parseInt(day)}일</span>
              <span className="hero-day-badge">{dayOfWeek}요일</span>
            </div>
            {streak > 0 && <div className="hero-streak">🔥 {streak}일 연속 기록 중</div>}
            <button className="hero-write-btn" onClick={() => navigate('/write')}>✏️ 오늘 일기 쓰기</button>
          </div>
          <div className="hero-right">
            <LiveClock />
            <WeatherCard size={36} />
            <span className="weather-city">서울</span>
          </div>
        </div>

        {/* ② 퀵 체크인 + 스탬프 달력 */}
        <div className="home-checkin-row">
          <QuickCheckIn todayHasEntry={todayHasEntry} navigate={navigate} />
          <StampCalendar diaries={diaries} year={year} month={month} />
        </div>

        {/* ③ 인사이트 2열 */}
        <div className="home-insights-row">

          {/* 감정 도넛 차트 */}
          <div className="home-donut-card card">
            <div className="section-head">
              <span className="section-title">이번 달 감정</span>
              <span className="section-badge">{parseInt(month)}월</span>
            </div>
            <div className="donut-body">
              <DonutChart data={emotionDist} />
              <div className="donut-legend">
                {emotionDist.length > 0
                  ? emotionDist.slice(0, 5).map(d => (
                      <div key={d.emotion} className="legend-item">
                        <span className="legend-dot" style={{ background: EMOTION_COLOR[d.emotion] ?? '#ccc' }} />
                        <span className="legend-label">{d.emotion}</span>
                        <span className="legend-pct">{d.percentage}%</span>
                      </div>
                    ))
                  : <p className="donut-empty-msg">일기를 작성하면<br />감정 분포가 표시돼요.</p>
                }
              </div>
            </div>
            <button className="donut-detail-btn" onClick={() => navigate('/stats')}>전체 통계 보기 →</button>
          </div>

          {/* AI 인사이트 */}
          <div className="home-insight-card card">
            <div className="section-head">
              <span className="section-title">AI 감정 인사이트</span>
              <span className="section-badge">{parseInt(month)}월</span>
            </div>
            <div className="insight-body">
              <img src={mascotImg} alt="" className="insight-mascot" />
              <p className="insight-text">
                {aiSummary ?? '일기를 3편 이상 작성하면\nAI 월간 감정 분석이 생성돼요.'}
              </p>
            </div>
            {keywords.length > 0 && (
              <div className="insight-keywords">
                <span className="kw-label">이번 달 키워드</span>
                <div className="kw-chips">
                  {keywords.slice(0, 6).map(k => (
                    <span key={k.text} className="kw-chip">#{k.text}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ④ 주간 리포트 배너 */}
        <div className="home-weekly-banner card" onClick={() => navigate('/weekly-report')}>
          <div className="weekly-left">
            <span className="weekly-label">WEEKLY REPORT</span>
            <p className="weekly-title">이번 주 감정 리포트가 준비됐어요</p>
            <p className="weekly-sub">어떤 감정이 가장 많았는지, AI가 분석해드릴게요.</p>
          </div>
          <button className="weekly-cta" onClick={e => { e.stopPropagation(); navigate('/weekly-report'); }}>
            리포트 보기 →
          </button>
        </div>

        {/* ⑤ 편지 카드 */}
        {(() => {
          const unread = letters.filter(l => !l.isRead);
          const latest = unread[0] ?? letters[0] ?? null;
          const hasUnread = unread.length > 0;
          return (
            <div
              className={`home-letter-card card${hasUnread ? ' home-letter-unread' : ''}`}
              onClick={() => navigate('/letters')}
            >
              <img src={mascotImg} alt="" className="hlc-mascot" />
              <div className="hlc-body">
                <div className="hlc-top">
                  <span className="hlc-title">
                    {hasUnread ? `${characterName ?? 'AI 친구'}의 편지가 도착했어요` : '편지함'}
                  </span>
                  {hasUnread && <span className="hlc-badge">{unread.length}</span>}
                </div>
                <p className="hlc-preview">
                  {latest
                    ? latest.title ?? '새 편지를 확인해보세요'
                    : '아직 편지가 없어요. 일기를 쓰면 편지가 와요 💌'}
                </p>
              </div>
              <button className="hlc-cta" onClick={e => { e.stopPropagation(); navigate('/letters'); }}>
                {hasUnread ? '읽기 →' : '편지함 →'}
              </button>
            </div>
          );
        })()}

        {/* ⑥ 일기 리스트 */}
        <div className="diary-section card">
          <div className="diary-header">
            <h2 className="diary-title">내 일기</h2>
            <div className="diary-controls">
              <div className="search-group">
                <select className="search-select" value={searchType} onChange={e => setSearchType(e.target.value)}>
                  <option>날짜</option>
                  <option>감정</option>
                  <option>제목</option>
                </select>
                <input
                  className="search-input"
                  type="text"
                  placeholder={`${searchType}으로 검색`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="write-btn" onClick={() => navigate('/write')}>✏️ 일기 작성</button>
            </div>
          </div>
          <div className="diary-table">
            <div className="diary-table-head">
              <span>제목</span><span>날짜</span><span>AI 분석</span><span>공개</span>
            </div>
            {loading ? (
              <div className="diary-empty">불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div className="diary-empty">일기가 없습니다.</div>
            ) : filtered.map(d => (
              <div key={d.id} className="diary-row" onClick={() => navigate(`/diary/${d.id}`)}>
                <span className="dr-title">{d.title}</span>
                <span className="dr-date">{formatDate(d.diaryDate)}</span>
                <span className="dr-emotion">{STATUS_LABEL[d.status] ?? '-'}</span>
                <span className="dr-pub">{d.isSecret ? '🔒 비공개' : '🌐 공개'}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      <SidebarRight stats={stats} diaries={diaries} monthStr={monthStr} characterName={character?.name} />
    </div>
  );
};

export default Home;
