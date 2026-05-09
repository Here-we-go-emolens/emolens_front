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
import "@/styles/Home/Home.css";

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

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

const formatDate = (dateStr) => dateStr?.replace(/-/g, '.') ?? '';

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

const Home = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const dayOfWeek = DAYS[now.getDay()];
  const monthStr = `${year}-${month}`;

  const [diaries, setDiaries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchType,  setSearchType]  = useState('제목');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats]         = useState(null);
  const [showTutorial, setShowTutorial]       = useState(false);
  const [showLetterPopup, setShowLetterPopup] = useState(false);
  const [characterName, setCharacterName]     = useState(null);
  const [unreadLetterId, setUnreadLetterId]   = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    if (!localStorage.getItem(`emolens_tutorial_done_${user.id}`)) setShowTutorial(true);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || showTutorial) return;
    getMyCharacter().catch((err) => {
      if (err.response?.status === 404) navigate('/character?next=/home');
    });
  }, [user?.id, showTutorial]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.id || showTutorial) return;
    const sessionKey = `emolens_letter_popup_${user.id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    Promise.all([getLetters(), getMyCharacter().catch(() => null)])
      .then(([letters, character]) => {
        const unread = letters.find(l => !l.isRead);
        if (!unread) return;
        setUnreadLetterId(unread.id);
        setCharacterName(character?.name ?? null);
        setShowLetterPopup(true);
        sessionStorage.setItem(sessionKey, 'true');
      }).catch(() => {});
  }, [user?.id, showTutorial]);

  useEffect(() => {
    getDiaryList(0, 50).then(data => setDiaries(data.content ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getStats(monthStr).then(setStats).catch(() => {});
  }, [monthStr]);

  const filtered = diaries.filter(d => {
    if (!searchQuery) return true;
    if (searchType === '제목') return d.title.includes(searchQuery);
    if (searchType === '날짜') return formatDate(d.diaryDate).includes(searchQuery);
    return true;
  });

  const streak     = stats?.summary?.streak ?? 0;
  const emotionDist = stats?.emotionDistribution ?? [];
  const keywords   = stats?.keywords ?? [];
  const aiSummary  = stats?.aiInsights?.summary ?? null;

  return (
    <div className="home-layout">
      {showTutorial && <TutorialOverlay userId={user?.id} onDone={() => setShowTutorial(false)} />}
      {showLetterPopup && (
        <LetterPopup characterName={characterName} letterId={unreadLetterId} onClose={() => setShowLetterPopup(false)} />
      )}

      <SidebarLeft />

      <main className="main-content">

        {/* ① Hero */}
        <div className="home-hero card">
          <div className="hero-left">
            <div className="hero-date-wrap">
              <span className="hero-date-num">{parseInt(month)}월 {parseInt(day)}일</span>
              <span className="hero-day-badge">{dayOfWeek}요일</span>
            </div>
            {streak > 0 && <div className="hero-streak">🔥 {streak}일 연속 기록 중</div>}
            <button className="hero-write-btn" onClick={() => navigate('/write')}>✏️ 오늘 일기 쓰기</button>
          </div>
          <div className="hero-right">
            <WeatherCard size={44} />
            <span className="weather-city">서울</span>
          </div>
        </div>

        {/* ② 인사이트 2열 */}
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

        {/* ③ 주간 리포트 배너 */}
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

        {/* ④ 일기 리스트 */}
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

      <SidebarRight />
    </div>
  );
};

export default Home;
