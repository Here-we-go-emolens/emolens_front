import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import '@/styles/DiaryDetail/DiaryDetailPage.css';

// ── 더미 데이터 (추후 API로 교체) ──────────────────────────
const DIARY = {
  id: 1,
  title: '괜히 마음이 복잡했던 날',
  date: '2026년 03월 31일 월요일',
  dateShort: '2026.03.31',
  weather: { desc: '흐림', temp: 17, icon: '⛅' },
  emotion: '😔',
  content: `오늘은 하루 종일 뭔가 마음이 가라앉지 않았다. 해야 할 일은 많았는데 쉽게 집중이 되지 않았고, 작은 일에도 괜히 예민해지는 기분이었다. 수업이 끝난 뒤 혼자 잠깐 걸었는데, 그때서야 조금 숨이 트이는 느낌이 들었다. 큰 일은 아니었지만, 스스로를 다독일 시간이 필요했던 하루였던 것 같다.

저녁에는 아무것도 하고 싶지 않아서 그냥 누워 있었다. 의무감에 억지로 뭔가를 하려다가 결국 아무것도 못 하고 시간만 보냈다. 그 공허함이 오히려 더 피곤하게 느껴졌다. 해야 할 일 목록을 다시 펼쳤다가 덮었다. 그냥 오늘은 여기까지가 나의 한계인 것 같다는 생각이 들었다.

이상하게도 혼자 걸을 때 들었던 노래 한 곡이 계속 생각났다. 딱히 슬픈 노래도 아니었는데, 그 순간만큼은 뭔가 괜찮은 기분이 들었다. 아마도 잠깐이나마 아무 생각 없이 걷는 시간이 필요했던 것 같다.

내일은 조금 달랐으면 좋겠다. 특별히 잘해야 한다는 생각보다는, 그냥 조금 더 가볍게 살 수 있으면 좋겠다는 생각을 했다. 어쩌면 그게 지금의 나에게 가장 필요한 일일지도 모른다.`,
};

const ANALYSIS = {
  mainEmotion:   { label: '부담감', percent: 72, color: '#7c6fcd' },
  subEmotions: [
    { label: '피로감', percent: 18, color: '#a89ee0' },
    { label: '무기력', percent: 10, color: '#c9c3ec' },
  ],
  summary: '오늘은 해야 할 일이 많아 부담감과 피로가 쌓인 하루로 보입니다. 혼자만의 산책 시간이 감정 완화에 도움이 되었어요.',
  keywords: ['부담감', '피곤함', '예민함', '회복 필요', '공허함'],
  causes: [
    '해야 할 일이 많아 압박감이 커짐',
    '집중이 잘 되지 않아 자기비판이 생김',
    '혼자 걷는 시간이 감정 완화에 도움을 줌',
  ],
  recommendations: [
    { icon: '📋', text: '오늘은 해야 할 일을 3개 이하로 줄여보세요' },
    { icon: '🚶', text: '10분 정도 가볍게 산책해보세요' },
    { icon: '📝', text: '자기 전 짧게 오늘의 감정을 다시 정리해보세요' },
  ],
  comparison: [
    { icon: '↑', text: '어제보다 스트레스가 조금 증가했어요', type: 'warn' },
    { icon: '✦', text: '지난 기록보다 감정 표현이 더 구체적이에요', type: 'good' },
  ],
};

const MENU_ITEMS = [
  { label: '홈',           icon: '🏠', route: '/'        },
  { label: '일기 작성',    icon: '✏️', route: '/write'   },
  { label: '대화형 일기',  icon: '🤖', route: '/ai-chat' },
  { label: '통계',         icon: '📊', route: '/stats'   },
  { label: '설정',         icon: '⚙️', route: null        },
];

// ── EmotionBar ──────────────────────────────────────────────
function EmotionBar({ label, percent, color, size = 'md' }) {
  return (
    <div className={`emo-bar-wrap ${size}`}>
      <div className="emo-bar-top">
        <span className="emo-bar-label">{label}</span>
        <span className="emo-bar-pct" style={{ color }}>{percent}%</span>
      </div>
      <div className="emo-bar-track">
        <div
          className="emo-bar-fill"
          style={{ '--pct': `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── AnalysisCard ────────────────────────────────────────────
function AnalysisCard({ icon, title, children }) {
  return (
    <div className="ac-card">
      <div className="ac-head">
        <span className="ac-icon">{icon}</span>
        <span className="ac-title">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ── PremiumLockCard ──────────────────────────────────────────
function PremiumLockCard({ title, previewLines = [] }) {
  const navigate = useNavigate();
  return (
    <div className="premium-lock-card">
      <div className="plc-blur-content">
        {previewLines.map((line, i) => (
          <div key={i} className="plc-blur-line" style={{ width: line }} />
        ))}
      </div>
      <div className="plc-overlay">
        <span className="plc-lock">🔒</span>
        <p className="plc-title">{title}</p>
        <button className="plc-cta" onClick={() => navigate('/premium')}>
          Premium에서 확인하기
        </button>
      </div>
    </div>
  );
}

// ── 메인 페이지 ─────────────────────────────────────────────
export default function DiaryDetailPage() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const user = useCurrentUser();
  const isActive = (route) => route && pathname.startsWith(route);

  return (
    <div className="dd-layout">

      {/* ── 왼쪽 사이드바 ─────────────────────── */}
      <aside className="dd-sidebar">
        <div className="dd-profile">
          <div className="dd-profile-img">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="profile" />
          </div>
          <div className="dd-profile-name">{user?.nickname ?? '...'}</div>
          <div className="dd-profile-tag">{user?.tag ?? ''}</div>
        </div>
        <nav className="dd-nav">
          {MENU_ITEMS.map(item => (
            <button
              key={item.label}
              className={`dd-nav-item ${isActive(item.route) ? 'active' : ''}`}
              onClick={() => item.route && navigate(item.route)}
            >
              <span className="dd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── 가운데 본문 ──────────────────────── */}
      <main className="dd-main">

        {/* 일기 헤더 카드 */}
        <div className="dd-header-card">
          <div className="dd-header-left">
            <div className="dd-emotion-badge">{DIARY.emotion}</div>
            <div>
              <h1 className="dd-title">{DIARY.title}</h1>
              <div className="dd-meta">
                <span className="dd-meta-item">📅 {DIARY.date}</span>
                <span className="dd-meta-sep">·</span>
                <span className="dd-meta-item">
                  {DIARY.weather.icon} {DIARY.weather.desc}, {DIARY.weather.temp}°C
                </span>
              </div>
            </div>
          </div>
          <div className="dd-header-badge">
            <span className="analysis-badge">✦ AI 분석 완료</span>
          </div>
        </div>

        {/* 일기 본문 */}
        <div className="dd-body-card">
          <div className="dd-body-label">일기 본문</div>
          <div className="dd-body-text">
            {DIARY.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="dd-actions">
          <div className="dd-actions-left">
            <button className="dd-btn btn-ghost">← 목록으로</button>
            <button className="dd-btn btn-secondary">✏️ 수정하기</button>
            <button className="dd-btn btn-danger">🗑 삭제</button>
          </div>
          <button className="dd-btn btn-primary">
            🤖 AI와 이어서 대화하기
          </button>
        </div>

      </main>

      {/* ── 오른쪽 AI 분석 패널 ──────────────── */}
      <aside className="dd-panel">

        {/* 감정 분석 */}
        <AnalysisCard icon="💜" title="오늘의 감정 분석">
          <EmotionBar
            label={ANALYSIS.mainEmotion.label}
            percent={ANALYSIS.mainEmotion.percent}
            color={ANALYSIS.mainEmotion.color}
            size="lg"
          />
          <div className="sub-emotions">
            {ANALYSIS.subEmotions.map(e => (
              <EmotionBar key={e.label} label={e.label} percent={e.percent} color={e.color} />
            ))}
          </div>
        </AnalysisCard>

        {/* AI 한줄 해석 */}
        <AnalysisCard icon="💬" title="AI 한줄 해석">
          <blockquote className="ai-summary">
            "{ANALYSIS.summary}"
          </blockquote>
        </AnalysisCard>

        {/* 감정 키워드 */}
        <AnalysisCard icon="🏷" title="감정 키워드">
          <div className="kw-chips">
            {ANALYSIS.keywords.map(k => (
              <span key={k} className="kw-chip">{k}</span>
            ))}
          </div>
        </AnalysisCard>

        {/* 추천 행동 - 무료: 1개만 공개 */}
        <AnalysisCard icon="🌱" title="추천 행동">
          <div className="rec-list">
            <div className="rec-item">
              <span className="rec-icon">{ANALYSIS.recommendations[0].icon}</span>
              <span>{ANALYSIS.recommendations[0].text}</span>
            </div>
          </div>
          <div className="rec-premium-hint">
            <span className="rec-hint-text">🔒 추천 2가지 더 보기</span>
            <button className="rec-hint-btn" onClick={() => navigate('/premium')}>Premium</button>
          </div>
        </AnalysisCard>

        {/* 감정 원인 추정 - Premium 잠금 */}
        <AnalysisCard icon="🔍" title="감정 원인 추정">
          <PremiumLockCard
            title="감정의 근본 원인을 분석해드려요"
            previewLines={['85%', '70%', '60%']}
          />
        </AnalysisCard>

        {/* 이전 일기와 비교 - Premium 잠금 */}
        <AnalysisCard icon="📈" title="이전 일기와 비교">
          <PremiumLockCard
            title="지난 기록과 비교해 패턴을 발견하세요"
            previewLines={['90%', '65%']}
          />
        </AnalysisCard>

      </aside>
    </div>
  );
}
