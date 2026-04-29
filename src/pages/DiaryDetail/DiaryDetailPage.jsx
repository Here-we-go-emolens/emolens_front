import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getDiary, deleteDiary } from '@/services/diaryApi';
import '@/styles/DiaryDetail/DiaryDetailPage.css';

const EMOTION_COLORS = ['#7c6fcd', '#a89ee0', '#c9c3ec', '#e0bbff', '#b8d4ff'];

const WEATHER_ICON = { SUNNY: '☀️', CLOUDY: '⛅', RAINY: '🌧️', SNOWY: '❄️' };

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
  const { id }       = useParams();
  const user = useCurrentUser();
  const isActive = (route) => route && pathname.startsWith(route);

  const [diary, setDiary]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiary(id)
      .then(setDiary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('일기를 삭제하시겠습니까?')) return;
    await deleteDiary(id);
    navigate('/home');
  };


  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9088a8' }}>불러오는 중...</div>;
  if (!diary)  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9088a8' }}>일기를 찾을 수 없습니다.</div>;

  const mainEmotion = diary.emotions?.[0];
  const subEmotions = diary.emotions?.slice(1) ?? [];
  const isCompleted = diary.status === 'COMPLETED';

  return (
    <div className="dd-layout">

      {/* ── 왼쪽 사이드바 ─────────────────────── */}
      <aside className="dd-sidebar">
        <div className="dd-profile">
          <div className="dd-profile-img">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="profile" />
          </div>
          <div className="dd-profile-name">{user?.name ?? '...'}</div>
          <div className="dd-profile-tag">{user?.tag ? `#${user.tag}` : ''}</div>
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
            <div className="dd-emotion-badge">{mainEmotion?.emotionName ?? '📖'}</div>
            <div>
              <h1 className="dd-title">{diary.title}</h1>
              <div className="dd-meta">
                <span className="dd-meta-item">📅 {diary.diaryDate}</span>
                {diary.weather && (
                  <>
                    <span className="dd-meta-sep">·</span>
                    <span className="dd-meta-item">{WEATHER_ICON[diary.weather] ?? '🌡️'} {diary.weather}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="dd-header-badge">
            <span className="analysis-badge">{isCompleted ? '✦ AI 분석 완료' : '⏳ 분석 중'}</span>
          </div>
        </div>

        {/* 일기 본문 */}
        <div className="dd-body-card">
          <div className="dd-body-label">일기 본문</div>
          <div className="dd-body-text">
            {diary.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {diary.imageUrls?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
              {diary.imageUrls.map((url, i) => {
                const src = url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
                return (
                  <img
                    key={i}
                    src={src}
                    alt={`첨부 이미지 ${i + 1}`}
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                    onClick={() => window.open(src, '_blank')}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="dd-actions">
          <div className="dd-actions-left">
            <button className="dd-btn btn-ghost" onClick={() => navigate('/home')}>← 목록으로</button>
            <button className="dd-btn btn-danger" onClick={handleDelete}>🗑 삭제</button>
          </div>
          <button className="dd-btn btn-primary" onClick={() => navigate('/ai-chat')}>
            🤖 AI와 이어서 대화하기
          </button>
        </div>

      </main>

      {/* ── 오른쪽 AI 분석 패널 ──────────────── */}
      <aside className="dd-panel">

        {/* 감정 분석 */}
        <AnalysisCard icon="💜" title="오늘의 감정 분석">
          {!isCompleted ? (
            <p style={{ color: '#9088a8', fontSize: '13px' }}>AI 분석이 완료되면 표시됩니다.</p>
          ) : mainEmotion ? (
            <>
              <EmotionBar label={mainEmotion.emotionName} percent={mainEmotion.score} color={EMOTION_COLORS[0]} size="lg" />
              <div className="sub-emotions">
                {subEmotions.map((e, i) => (
                  <EmotionBar key={e.emotionName} label={e.emotionName} percent={e.score} color={EMOTION_COLORS[i + 1] ?? '#c9c3ec'} />
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#9088a8', fontSize: '13px' }}>감정 데이터가 없습니다.</p>
          )}
        </AnalysisCard>

        {/* AI 한줄 해석 */}
        <AnalysisCard icon="💬" title="AI 한줄 해석">
          <blockquote className="ai-summary">
            "{isCompleted && diary.feedback ? diary.feedback : '분석이 완료되면 표시됩니다.'}"
          </blockquote>
        </AnalysisCard>

        {/* 감정 키워드 */}
        <AnalysisCard icon="🏷" title="감정 키워드">
          <div className="kw-chips">
            {isCompleted && diary.keywords?.length > 0
              ? diary.keywords.map(k => <span key={k} className="kw-chip">{k}</span>)
              : <span style={{ color: '#9088a8', fontSize: '13px' }}>분석이 완료되면 표시됩니다.</span>
            }
          </div>
        </AnalysisCard>

        {/* 추천 행동 - 무료: 1개만 공개 */}
        <AnalysisCard icon="🌱" title="추천 행동">
          {isCompleted && diary.recommendations?.length > 0 ? (
            <>
              <div className="rec-list">
                <div className="rec-item">
                  <span className="rec-icon">🌱</span>
                  <span>{diary.recommendations[0].content}</span>
                </div>
              </div>
              {diary.recommendations.length > 1 && (
                <div className="rec-premium-hint">
                  <span className="rec-hint-text">🔒 추천 {diary.recommendations.length - 1}가지 더 보기</span>
                  <button className="rec-hint-btn" onClick={() => navigate('/premium')}>Premium</button>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#9088a8', fontSize: '13px' }}>분석이 완료되면 표시됩니다.</p>
          )}
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
