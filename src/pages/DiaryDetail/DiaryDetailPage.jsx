import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getDiary, deleteDiary, updateDiary } from '@/services/diaryApi';
import '@/styles/DiaryDetail/DiaryDetailPage.css';

const EMOTION_COLORS = ['#7c6fcd', '#a89ee0', '#c9c3ec', '#e0bbff', '#b8d4ff'];

const WEATHER_ICON = { SUNNY: '☀️', CLOUDY: '⛅', RAINY: '🌧️', SNOWY: '❄️' };

const TEMPLATE_LABELS = {
  '오늘의 감정:': '😊 오늘의 감정',
  '좋았던 일:':   '😊 좋았던 일',
  '아쉬웠던 일:': '😔 아쉬웠던 일',
  '내일의 다짐:': '🌱 내일의 다짐',
};

function renderContent(content, templateType) {
  const paras = content.split('\n\n');

  if (templateType === 'letter') {
    const toLine   = paras.find(p => p.startsWith('To. '));
    const fromLine = paras.find(p => p.startsWith('From. '));
    const body     = paras.filter(p => !p.startsWith('To. ') && !p.startsWith('From. '));
    return (
      <div style={{ fontFamily: 'Georgia, serif', lineHeight: '1.9', background: '#fffdf7', borderRadius: '12px', padding: '24px 28px', border: '1px solid #f0e8d0' }}>
        <div style={{ textAlign: 'center', color: '#c9a96e', fontSize: '12px', letterSpacing: '3px', marginBottom: '20px' }}>✦ emolens diary ✦</div>
        {toLine   && <p style={{ color: '#7c6fcd', fontWeight: 600, marginBottom: '20px' }}>{toLine}</p>}
        {body.map((p, i) => <p key={i} style={{ marginBottom: '14px', color: '#444' }}>{p}</p>)}
        {fromLine && <p style={{ color: '#7c6fcd', fontWeight: 600, marginTop: '20px', textAlign: 'right' }}>{fromLine}</p>}
      </div>
    );
  }

  if (templateType === 'template') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {paras.map((p, i) => {
          const key = Object.keys(TEMPLATE_LABELS).find(k => p.startsWith(k));
          if (!key) return null;
          const value = p.slice(key.length).trim();
          return (
            <div key={i} style={{ background: '#f8f6ff', borderRadius: '10px', padding: '14px 18px' }}>
              <div style={{ fontSize: '12px', color: '#9088a8', marginBottom: '6px' }}>{TEMPLATE_LABELS[key]}</div>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>{value}</div>
            </div>
          );
        })}
      </div>
    );
  }

  if (templateType === 'notebook') {
    return (
      <div style={{ background: '#fafafa', borderRadius: '8px', padding: '20px 24px', borderLeft: '3px solid #7c6fcd', lineHeight: '2.2', fontFamily: 'monospace', fontSize: '14px' }}>
        {paras.map((p, i) => <p key={i} style={{ marginBottom: '8px', borderBottom: '1px solid #efefef', paddingBottom: '8px' }}>{p}</p>)}
      </div>
    );
  }

  // plain (기본)
  return <>{paras.map((p, i) => <p key={i}>{p}</p>)}</>;
}

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
  const templateType = localStorage.getItem(`diary_template_${id}`) ?? 'plain';

  const [isEditing, setIsEditing]       = useState(false);
  const [editTitle, setEditTitle]       = useState('');
  const [editContent, setEditContent]   = useState('');
  const [editWeather, setEditWeather]   = useState('');
  const [editIsSecret, setEditIsSecret] = useState(false);
  const [editImageUrls, setEditImageUrls] = useState([]);
  const [submitting, setSubmitting]     = useState(false);

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

  const handleEditStart = () => {
    setEditTitle(diary.title);
    setEditContent(diary.content);
    setEditWeather(diary.weather ?? '');
    setEditIsSecret(diary.isSecret ?? false);
    setEditImageUrls(diary.imageUrls ?? []);
    setIsEditing(true);
  };

  const handleEditCancel = () => setIsEditing(false);

  const handleUpdate = async () => {
    if (!editTitle.trim()) { alert('제목을 입력해주세요.'); return; }
    if (!editContent.trim()) { alert('내용을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      await updateDiary(id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        weather: editWeather || null,
        isSecret: editIsSecret,
        imageUrls: editImageUrls,
      });
      setDiary(prev => ({
        ...prev,
        title: editTitle.trim(),
        content: editContent.trim(),
        weather: editWeather || null,
        isSecret: editIsSecret,
        imageUrls: editImageUrls,
      }));
      setIsEditing(false);
    } catch {
      alert('일기 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
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
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                maxLength={100}
                placeholder="제목"
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e0d9f0', fontSize: '15px', outline: 'none' }}
              />
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={10}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e0d9f0', fontSize: '14px', resize: 'vertical', outline: 'none', lineHeight: '1.7' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: '#7c6fcd', fontWeight: 600 }}>날씨</span>
                {['SUNNY', 'CLOUDY', 'RAINY', 'SNOWY'].map(w => (
                  <button
                    key={w}
                    onClick={() => setEditWeather(w)}
                    style={{
                      padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                      border: editWeather === w ? '2px solid #7c6fcd' : '1.5px solid #e0d9f0',
                      background: editWeather === w ? '#f0edf8' : '#fff',
                      color: editWeather === w ? '#7c6fcd' : '#555',
                    }}
                  >
                    {WEATHER_ICON[w]} {w}
                  </button>
                ))}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editIsSecret}
                  onChange={e => setEditIsSecret(e.target.checked)}
                />
                🔒 비공개
              </label>
            </div>
          ) : (
            <>
              <div className="dd-body-text">
                {renderContent(diary.content, templateType)}
              </div>
              {diary.imageUrls?.length > 0 && (
                <div className="dd-image-gallery">
                  {diary.imageUrls.map((url, i) => {
                    const src = url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
                    return (
                      <div key={i} className="dd-image-item" onClick={() => window.open(src, '_blank')}>
                        <img src={src} alt={`첨부 이미지 ${i + 1}`} />
                        <div className="dd-image-overlay"><span>🔍 크게 보기</span></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="dd-actions">
          <div className="dd-actions-left">
            <button className="dd-btn btn-ghost" onClick={() => navigate('/home')}>← 목록으로</button>
            {!isEditing && <button className="dd-btn btn-danger" onClick={handleDelete}>🗑 삭제</button>}
          </div>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="dd-btn btn-ghost" onClick={handleEditCancel} disabled={submitting}>취소</button>
              <button className="dd-btn btn-primary" onClick={handleUpdate} disabled={submitting}>
                {submitting ? '저장 중…' : '저장'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="dd-btn btn-ghost" onClick={handleEditStart}>✏️ 수정</button>
              <button className="dd-btn btn-primary" onClick={() => navigate('/ai-chat')}>
                🤖 AI와 이어서 대화하기
              </button>
            </div>
          )}
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
