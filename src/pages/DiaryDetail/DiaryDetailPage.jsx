import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import { getDiary, deleteDiary, updateDiary } from '@/services/diaryApi';
import mascotImg from '@/assets/mascot-removebg-preview.png';
import '@/styles/DiaryDetail/DiaryDetailPage.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const WEATHER_ICON = { SUNNY: '☀️', CLOUDY: '⛅', RAINY: '🌧️', SNOWY: '❄️' };

const TEMPLATE_LABELS = {
  '오늘의 감정:': '😊 오늘의 감정',
  '좋았던 일:':   '😊 좋았던 일',
  '아쉬웠던 일:': '😔 아쉬웠던 일',
  '내일의 다짐:': '🌱 내일의 다짐',
};

const EMOTION_CONFIG = {
  '기쁨':   { bg: '#fffbe8', color: '#FFD93D', icon: '😊' },
  '행복':   { bg: '#fffbe8', color: '#FFD93D', icon: '😊' },
  '설렘':   { bg: '#fff4e8', color: '#f26a21', icon: '🥰' },
  '평온':   { bg: '#e8f6f7', color: '#48CAE4', icon: '😌' },
  '슬픔':   { bg: '#eef3ff', color: '#74B9FF', icon: '😢' },
  '우울':   { bg: '#eef3ff', color: '#74B9FF', icon: '😔' },
  '분노':   { bg: '#fff0f0', color: '#FF7675', icon: '😤' },
  '불안':   { bg: '#f3f0ff', color: '#A29BFE', icon: '😟' },
  '두려움': { bg: '#f3f0ff', color: '#A29BFE', icon: '😨' },
};

const FALLBACK_COLORS = ['#f26a21', '#FFD93D', '#7c6fcd', '#74B9FF', '#48CAE4', '#FF7675', '#A29BFE', '#6BCB77'];

const MASCOT_SPEECH = {
  '기쁨':   '오늘 정말 행복해 보여요! 😊',
  '행복':   '행복한 하루를 보내셨군요! 😊',
  '설렘':   '설레는 마음이 전해져요! ✨',
  '평온':   '차분하고 평온한 하루였군요 🌿',
  '슬픔':   '많이 힘드셨겠어요. 제가 있을게요 💙',
  '우울':   '오늘 하루 잘 버텨내셨어요 💙',
  '분노':   '많이 답답하셨겠어요. 다 표현해도 돼요 💪',
  '불안':   '걱정이 많으셨군요. 함께 살펴봐요 🤍',
  '두려움': '괜찮아요. 제가 함께할게요 🤍',
};

function emotionColor(name, idx) {
  return EMOTION_CONFIG[name]?.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

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
          return (
            <div key={i} style={{ background: '#f8f6ff', borderRadius: '10px', padding: '14px 18px' }}>
              <div style={{ fontSize: '12px', color: '#9088a8', marginBottom: '6px' }}>{TEMPLATE_LABELS[key]}</div>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>{p.slice(key.length).trim()}</div>
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
  return <>{paras.map((p, i) => <p key={i}>{p}</p>)}</>;
}

function PremiumLockCard({ title }) {
  const navigate = useNavigate();
  return (
    <div className="plc-wrap">
      <div className="plc-blur-rows">
        <div className="plc-blur-row" style={{ width: '80%' }} />
        <div className="plc-blur-row" style={{ width: '55%' }} />
      </div>
      <div className="plc-overlay">
        <span style={{ fontSize: '18px' }}>🔒</span>
        <p className="plc-label">{title}</p>
        <button className="plc-btn" onClick={() => navigate('/premium')}>Premium에서 보기</button>
      </div>
    </div>
  );
}

export default function DiaryDetailPage() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [diary, setDiary]     = useState(null);
  const [loading, setLoading] = useState(true);
  const templateType = localStorage.getItem(`diary_template_${id}`) ?? 'plain';

  const [isEditing, setIsEditing]         = useState(false);
  const [editTitle, setEditTitle]         = useState('');
  const [editContent, setEditContent]     = useState('');
  const [editWeather, setEditWeather]     = useState('');
  const [editIsSecret, setEditIsSecret]   = useState(false);
  const [editImageUrls, setEditImageUrls] = useState([]);
  const [submitting, setSubmitting]       = useState(false);

  useEffect(() => {
    getDiary(id).then(setDiary).catch(() => {}).finally(() => setLoading(false));
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

  const handleUpdate = async () => {
    if (!editTitle.trim())   { alert('제목을 입력해주세요.'); return; }
    if (!editContent.trim()) { alert('내용을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      await updateDiary(id, {
        title: editTitle.trim(), content: editContent.trim(),
        weather: editWeather || null, isSecret: editIsSecret, imageUrls: editImageUrls,
      });
      setDiary(prev => ({ ...prev, title: editTitle.trim(), content: editContent.trim(), weather: editWeather || null, isSecret: editIsSecret, imageUrls: editImageUrls }));
      setIsEditing(false);
    } catch {
      alert('일기 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="dd-fullcenter"><div className="dd-spinner" /><p>불러오는 중...</p></div>
  );
  if (!diary) return (
    <div className="dd-fullcenter"><p>일기를 찾을 수 없습니다.</p><button className="dd-btn btn-ghost" onClick={() => navigate('/home')}>홈으로</button></div>
  );

  const emotions     = diary.emotions ?? [];
  const mainEmotion  = emotions[0];
  const emoName      = mainEmotion?.emotionName ?? '';
  const isCompleted  = diary.status === 'COMPLETED';
  const heroBg       = EMOTION_CONFIG[emoName]?.bg ?? '#f8f6ff';
  const mascotSpeech = MASCOT_SPEECH[emoName] ?? '오늘 하루, 정말 의미 있었네요 😊';

  const donutData = {
    labels: emotions.map(e => e.emotionName),
    datasets: [{
      data: emotions.map(e => e.score),
      backgroundColor: emotions.map((e, i) => emotionColor(e.emotionName, i)),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}%` } },
    },
    cutout: '68%',
  };

  return (
    <div className="dd-layout">
      <SidebarLeft />

      {/* ── 가운데 본문 ──────────────────────── */}
      <main className="dd-main">

        {/* 상단 바 */}
        <div className="dd-topbar">
          <button className="dd-back-btn" onClick={() => navigate('/home')}>← 목록으로</button>
          <div className="dd-topbar-actions">
            {isEditing ? (
              <>
                <button className="dd-btn btn-ghost" onClick={() => setIsEditing(false)} disabled={submitting}>취소</button>
                <button className="dd-btn btn-primary" onClick={handleUpdate} disabled={submitting}>
                  {submitting ? '저장 중…' : '저장'}
                </button>
              </>
            ) : (
              <>
                <button className="dd-btn btn-ghost" onClick={handleEditStart}>✏️ 수정</button>
                <button className="dd-btn btn-danger" onClick={handleDelete}>🗑 삭제</button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          /* ── 수정 모드 ── */
          <div className="dd-edit-card">
            <div className="dd-card-label">✏️ 일기 수정</div>
            <div className="dd-edit-form">
              <input className="dd-edit-input" type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} maxLength={100} placeholder="제목" />
              <textarea className="dd-edit-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} placeholder="내용을 입력하세요" rows={12} />
              <div className="dd-edit-row">
                <span className="dd-edit-row-label">날씨</span>
                {['SUNNY', 'CLOUDY', 'RAINY', 'SNOWY'].map(w => (
                  <button key={w} className={`dd-weather-btn ${editWeather === w ? 'active' : ''}`} onClick={() => setEditWeather(w)}>
                    {WEATHER_ICON[w]} {w}
                  </button>
                ))}
              </div>
              <label className="dd-edit-secret">
                <input type="checkbox" checked={editIsSecret} onChange={e => setEditIsSecret(e.target.checked)} />
                🔒 비공개
              </label>
            </div>
          </div>
        ) : (
          <>
            {/* ── 1. 상단 요약 카드 ── */}
            <div className="dd-hero-card" style={{ background: heroBg }}>

              {/* 왼쪽: 아이콘 + 제목 */}
              <div className="dd-hero-body">
                <div className="dd-hero-top">
                  <span className="dd-hero-emoicon">{EMOTION_CONFIG[emoName]?.icon ?? '📖'}</span>
                  <div className="dd-hero-info">
                    <h1 className="dd-hero-title">{diary.title}</h1>
                    <div className="dd-hero-meta">
                      <span className="dd-meta-chip">📅 {diary.diaryDate}</span>
                      {diary.weather && <span className="dd-meta-chip">{WEATHER_ICON[diary.weather]} {diary.weather}</span>}
                      <span className={`dd-status-chip ${isCompleted ? 'done' : 'pending'}`}>
                        {isCompleted ? '✦ AI 분석완료' : '⏳ 분석중'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 마스코트 */}
              <div className="dd-mascot-area">
                <div className="dd-speech-bubble">{mascotSpeech}</div>
                <img src={mascotImg} alt="EmoLens 마스코트" className="dd-mascot-img" />
              </div>

            </div>

            {/* ── 2. 일기 본문 ── */}
            <div className="dd-content-card">
              <div className="dd-card-label">📝 일기 내용</div>
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
            </div>

            {/* ── 3. AI 핵심 요약 카드 ── */}
            <div className="dd-ai-summary-card">
              <span className="dd-ai-summary-icon">✨</span>
              <div className="dd-ai-summary-body">
                <div className="dd-ai-summary-label">오늘의 핵심 인사이트</div>
                <p className="dd-ai-summary-text">
                  {isCompleted && diary.feedback
                    ? `"${diary.feedback}"`
                    : '"AI 분석이 완료되면 오늘 하루의 핵심 인사이트를 보여드릴게요."'}
                </p>
              </div>
            </div>

            {/* ── 4. 추천 행동 ── */}
            <div className="dd-main-rec-card">
              <div className="dd-main-rec-head">
                <span className="dd-main-rec-icon">🌱</span>
                <div>
                  <div className="dd-main-rec-label">추천 행동</div>
                  <h2 className="dd-main-rec-title">내일 바로 해볼 한 가지</h2>
                </div>
              </div>
              {isCompleted && diary.recommendations?.length > 0 ? (
                <div className="dd-main-rec-list">
                  {diary.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={`${rec.type}-${index}`} className={`dd-main-rec-item ${index === 0 ? 'primary' : ''}`}>
                      <span className="dd-main-rec-step">{index + 1}</span>
                      <span className="dd-main-rec-text">{rec.content}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="dd-main-rec-empty">
                  {isCompleted ? '추천 행동 분석 결과가 없습니다.' : 'AI 분석이 완료되면 오늘에 맞는 추천 행동을 보여드릴게요.'}
                </p>
              )}
            </div>

            {/* ── 5. 하단 액션 카드 3개 ── */}
            <div className="dd-action-row">
              <button className="dd-action-card" onClick={() => navigate('/ai-chat')}>
                <span className="dd-action-icon">🤖</span>
                <div className="dd-action-body">
                  <div className="dd-action-title">AI와 더 이야기하기</div>
                  <div className="dd-action-desc">오늘 일기에 대해 더 깊이 대화해요</div>
                </div>
                <span className="dd-action-arrow">›</span>
              </button>
              <button className="dd-action-card" onClick={() => navigate('/stats')}>
                <span className="dd-action-icon">📈</span>
                <div className="dd-action-body">
                  <div className="dd-action-title">감정 변화 보기</div>
                  <div className="dd-action-desc">나의 감정 패턴을 확인해요</div>
                </div>
                <span className="dd-action-arrow">›</span>
              </button>
              <button className="dd-action-card" onClick={() => navigate('/write')}>
                <span className="dd-action-icon">🌱</span>
                <div className="dd-action-body">
                  <div className="dd-action-title">내일을 위한 한 가지 행동</div>
                  <div className="dd-action-desc">작은 실천으로 내일을 준비해요</div>
                </div>
                <span className="dd-action-arrow">›</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* ── 오른쪽 패널 ──────────────────────── */}
      <aside className="dd-panel">

        {/* 감정 분석 도넛 */}
        <div className="dd-panel-card">
          <div className="dd-panel-head"><span>💜</span><span>감정 분석</span></div>
          {isCompleted && emotions.length > 0 ? (
            <>
              <div className="dd-donut-wrap">
                <Doughnut data={donutData} options={donutOptions} />
                <div className="dd-donut-center">
                  <div className="dd-donut-emoicon">{EMOTION_CONFIG[emoName]?.icon ?? '💜'}</div>
                  <div className="dd-donut-emoname">{emoName}</div>
                </div>
              </div>
              <div className="dd-donut-legend">
                {emotions.map((e, i) => (
                  <div key={e.emotionName} className="dd-legend-row">
                    <span className="dd-legend-dot" style={{ background: emotionColor(e.emotionName, i) }} />
                    <span className="dd-legend-label">{e.emotionName}</span>
                    <span className="dd-legend-pct">{e.score}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="dd-muted-msg">AI 분석이 완료되면 표시됩니다.</p>
          )}
        </div>

        {/* 깊은 AI 분석 */}
        <div className="dd-panel-card">
          <div className="dd-panel-head"><span>🔍</span><span>깊은 AI 분석</span></div>
          {isCompleted ? (
            <div className="dd-deep-list">
              <div className="dd-deep-item">
                <span className="dd-deep-icon">💡</span>
                <div>
                  <div className="dd-deep-section-label">감정의 이유</div>
                  <div className="dd-deep-text">{diary.feedback ?? '분석 결과가 없습니다.'}</div>
                </div>
              </div>
              <div className="dd-deep-item">
                <span className="dd-deep-icon">✨</span>
                <div>
                  <div className="dd-deep-section-label">의미 있는 순간</div>
                  <div className="dd-deep-text">
                    {diary.keywords?.length > 0
                      ? `${diary.keywords.slice(0, 3).join(', ')} 등이 오늘의 의미 있는 키워드예요.`
                      : '키워드 분석 결과가 없습니다.'}
                  </div>
                </div>
              </div>
              <div className="dd-deep-item">
                <span className="dd-deep-icon">💎</span>
                <div>
                  <div className="dd-deep-section-label">내가 중요하게 생각한 것</div>
                  <div className="dd-deep-text">
                    {diary.recommendations?.[0]?.content ?? '추천 분석 결과가 없습니다.'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <PremiumLockCard title="분석이 완료되면 깊은 통찰을 보여드려요" />
          )}
        </div>

        {/* 감정 키워드 */}
        <div className="dd-panel-card">
          <div className="dd-panel-head"><span>🏷</span><span>감정 키워드</span></div>
          <div className="dd-kw-chips">
            {isCompleted && diary.keywords?.length > 0
              ? diary.keywords.map(k => <span key={k} className="dd-kw-chip">{k}</span>)
              : <span className="dd-muted-msg">분석이 완료되면 표시됩니다.</span>}
          </div>
        </div>

        {/* 추천 행동 */}
        <div className="dd-panel-card">
          <div className="dd-panel-head"><span>🌱</span><span>추천 행동</span></div>
          {isCompleted && diary.recommendations?.length > 0 ? (
            <>
              <div className="dd-rec-item">
                <span className="dd-rec-icon">🌱</span>
                <span className="dd-rec-text">{diary.recommendations[0].content}</span>
              </div>
              {diary.recommendations.length > 1 && (
                <div className="dd-rec-more">
                  <span>🔒 {diary.recommendations.length - 1}개 더 보기</span>
                  <button className="dd-rec-more-btn" onClick={() => navigate('/premium')}>Premium</button>
                </div>
              )}
            </>
          ) : (
            <p className="dd-muted-msg">분석이 완료되면 표시됩니다.</p>
          )}
        </div>

        {/* 감정 원인 - Premium 잠금 */}
        <div className="dd-panel-card">
          <div className="dd-panel-head"><span>📈</span><span>이전 일기와 비교</span></div>
          <PremiumLockCard title="지난 기록과 비교해 패턴을 발견하세요" />
        </div>

      </aside>
    </div>
  );
}
