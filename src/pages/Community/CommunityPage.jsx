import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import '@/styles/Home/Home.css';
import '@/styles/Community/CommunityPage.css';

/* ── Mock 데이터 ──────────────────────────────────── */
const CURRENT_EMOTION = { emoji: '😔', label: '부담감', pct: 62 };

const TODAY_PICKS = [
  {
    id: 'pick-1',
    role: '공감',
    roleDesc: '오늘 부담감을 느끼는 분들이 가장 많이 읽었어요',
    emotion: { emoji: '😔', label: '부담감' },
    similarity: 91,
    title: '발표 전날, 나도 항상 이랬어',
    content:
      '준비를 아무리 해도 떨리는 건 어쩔 수 없더라고. 그냥 그 감정이 나쁜 게 아니라는 걸 알게 됐을 때 조금 달라졌어.',
    author: '달빛여우',
    time: '오늘 오전 11시',
    reactions: { empathy: 47, comfort: 12, understand: 38 },
    actionCount: 23,
  },
  {
    id: 'pick-2',
    role: '인사이트',
    roleDesc: '비슷한 감정을 겪고 극복한 경험이에요',
    emotion: { emoji: '😔', label: '부담감' },
    similarity: 84,
    title: '할 일이 너무 많을 때 내가 쓰는 방법',
    content:
      '전부 다 해야 한다는 생각을 버리는 게 먼저였어. 오늘 딱 3개만 고르고 나머지는 내일로 미루는 연습을 했더니 오히려 더 많이 됐어.',
    author: '구름토끼',
    time: '어제 오후 9시',
    reactions: { empathy: 61, comfort: 8, understand: 72 },
    actionCount: 41,
  },
  {
    id: 'pick-3',
    role: '행동',
    roleDesc: '읽고 실제로 행동한 사람이 가장 많은 글이에요',
    emotion: { emoji: '😔', label: '부담감' },
    similarity: 78,
    title: '부담감 쌓일 때 나만의 5분 루틴',
    content:
      '타이머 5분 맞추고, 지금 머릿속에 있는 걱정을 전부 종이에 쏟아내. 그다음 그 중에 오늘 실제로 해결 가능한 것만 동그라미 쳐. 이것만 해도 훨씬 가벼워져.',
    author: '초록이',
    time: '어제 오후 2시',
    reactions: { empathy: 89, comfort: 31, understand: 104 },
    actionCount: 67,
  },
];

const EMOTION_FILTERS = [
  { id: 'all',       emoji: '',   label: '전체' },
  { id: 'burden',    emoji: '😔', label: '부담감' },
  { id: 'tired',     emoji: '😴', label: '피곤함' },
  { id: 'anxious',   emoji: '😰', label: '불안' },
  { id: 'calm',      emoji: '😌', label: '평온' },
  { id: 'excited',   emoji: '🌸', label: '설렘' },
  { id: 'irritated', emoji: '😤', label: '짜증' },
];

const SORT_OPTIONS = [
  { id: 'latest',  label: '최신순' },
  { id: 'empathy', label: '공감순' },
  { id: 'similar', label: '✨ 유사 감정순' },
];

const SIMILAR_USERS = [
  { id: 1, avatar: '🌙', name: '달빛여우',  emotion: '😔 부담감', similarity: 87, preview: '발표 준비하다 너무 지쳐서...' },
  { id: 2, avatar: '☁️',  name: '구름토끼',  emotion: '😔 부담감', similarity: 79, preview: '마감이 너무 많아요' },
  { id: 3, avatar: '🌿', name: '초록이',    emotion: '😰 불안',   similarity: 71, preview: '이번 주 너무 힘들어' },
  { id: 4, avatar: '🍂', name: '가을빛',    emotion: '😔 부담감', similarity: 65, preview: '아무것도 하기 싫다' },
  { id: 5, avatar: '🌊', name: '파도소리',  emotion: '😔 부담감', similarity: 58, preview: '매일 쌓이는 할 일들...' },
];

const POSTS = [
  {
    id: 1,
    emotion: { emoji: '😔', label: '부담감' },
    similarity: 87,
    title: '발표 전날 밤은 왜 이렇게 길까',
    content:
      '내일 팀 발표가 있는데 자꾸 최악의 상황만 상상돼. 준비는 다 했는데도 손이 떨리고 잠도 안 오고… 이런 감정 나만 느끼는 건지 너무 궁금해서 올려봐요.',
    author: '달빛여우',
    time: '23분 전',
    reactions: { empathy: 24, comfort: 8, understand: 31 },
    comments: 12,
  },
  {
    id: 2,
    emotion: { emoji: '😰', label: '불안' },
    similarity: 71,
    title: '요즘 아무것도 제대로 못하는 것 같아서',
    content:
      '열심히 하는데 결과가 안 나오니까 점점 자신감이 떨어지는 것 같아. 이게 나만의 문제인지, 아니면 다들 이런 시기가 있는 건지 궁금해.',
    author: '구름달',
    time: '1시간 전',
    reactions: { empathy: 41, comfort: 19, understand: 58 },
    comments: 23,
  },
  {
    id: 3,
    emotion: { emoji: '😴', label: '피곤함' },
    similarity: 54,
    title: '번아웃인지 그냥 게으른 건지 구분이 안 됨',
    content:
      '쉬어도 쉰 것 같지 않고, 뭔가 계속 해야 할 것 같은 느낌인데 정작 아무것도 못 하고 있어요. 이게 번아웃 맞나요?',
    author: '솔잎향기',
    time: '3시간 전',
    reactions: { empathy: 67, comfort: 34, understand: 89 },
    comments: 31,
  },
];

const EMOTION_TRENDS = [
  { emoji: '😔', label: '부담감', pct: 38 },
  { emoji: '😰', label: '불안',   pct: 27 },
  { emoji: '😴', label: '피곤함', pct: 21 },
  { emoji: '😌', label: '평온',   pct: 9  },
  { emoji: '🌸', label: '설렘',   pct: 5  },
];

const POPULAR_POSTS = [
  '발표 전날 밤은 왜 이렇게 길까',
  '마감 3일 전 나만의 생존 루틴',
  '불안할 때 내가 하는 한 가지',
  '번아웃인지 그냥 게으른 건지',
];

const ACTIONS = [
  { icon: '🧘', desc: '5분 호흡 명상 — 지금 바로 시작' },
  { icon: '📝', desc: '할 일 우선순위 3개만 적기' },
  { icon: '🚶', desc: '15분 산책, 핸드폰 없이' },
];

/* ── 컴포넌트 ─────────────────────────────────────── */
const CommunityPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('burden');
  const [activeSort, setActiveSort]   = useState('latest');
  const [reactions, setReactions]     = useState({});
  const [showPicks, setShowPicks]     = useState(false);
  const [pickIndex, setPickIndex]     = useState(0);

  const toggleReaction = (postId, type) => {
    const key = `${postId}-${type}`;
    setReactions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isReacted = (postId, type) => !!reactions[`${postId}-${type}`];

  const getCount = (post, type) =>
    post.reactions[type] + (isReacted(post.id, type) ? 1 : 0);

  return (
    <div className="home-layout">

      {/* ── 왼쪽 사이드바 (기존 유지) ── */}
      <SidebarLeft />

      {/* ── 중앙 메인 피드 ── */}
      <main className="main-content" style={{ gap: 0 }}>

        {/* ① Hero */}
        <div className="card community-hero" style={{ marginBottom: '14px' }}>
          <div className="community-hero-top">
            <div>
              <h1 className="community-hero-title">🌊 EchoLens</h1>
              <p className="community-hero-sub">
                비슷한 감정을 가진 사람들과 연결되는 공간
              </p>
            </div>
            <div className="community-hero-emotion">
              {CURRENT_EMOTION.emoji} {CURRENT_EMOTION.label} {CURRENT_EMOTION.pct}%
              <button className="btn-change-emotion">바꾸기</button>
            </div>
          </div>
          <div className="community-hero-actions">
            <button className="write-btn" onClick={() => navigate('/write')}>
              ✍️ 감정 나누기
            </button>
            <button className="btn-secondary" onClick={() => { setPickIndex(0); setShowPicks(true); }}>
              오늘의 추천 글 보기 →
            </button>
          </div>
        </div>

        {/* ② 감정 필터 + 정렬 */}
        <div className="card community-filter" style={{ marginBottom: '14px' }}>
          <div className="filter-chips-row">
            {EMOTION_FILTERS.map(f => (
              <button
                key={f.id}
                className={`filter-chip${activeFilter === f.id ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.emoji && `${f.emoji} `}{f.label}
              </button>
            ))}
          </div>

          <div className="sort-row">
            <span className="sort-label">정렬</span>
            {SORT_OPTIONS.map(s => (
              <button
                key={s.id}
                className={`sort-btn${activeSort === s.id ? ' active' : ''}`}
                onClick={() => setActiveSort(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {activeSort === 'similar' && (
            <div className="similarity-context">
              😔 부담감 기준으로 감정이 가장 비슷한 글을 먼저 보여드려요
            </div>
          )}
        </div>

        {/* ③ 유사 감정 유저 스트립 */}
        <div className="card similar-users-section" style={{ marginBottom: '14px' }}>
          <p className="section-title">✨ 지금 비슷한 감정을 겪고 있어요</p>
          <div className="similar-users-scroll">
            {SIMILAR_USERS.map(u => (
              <div key={u.id} className="similar-user-card">
                <div className="similar-user-avatar">{u.avatar}</div>
                <div className="similar-user-name">{u.name}</div>
                <div className="similar-user-emotion">{u.emotion}</div>
                <div className="similarity-badge">💜 {u.similarity}% 유사</div>
                <div className="similar-user-preview">"{u.preview}"</div>
              </div>
            ))}
          </div>
        </div>

        {/* ④ 게시글 피드 */}
        <div className="post-feed">
          {POSTS.map(post => (
            <div key={post.id} className="card post-card">

              <div className="post-card-top">
                <div className="post-emotion-tag">
                  {post.emotion.emoji} {post.emotion.label}
                </div>
                <div className={`post-similarity${activeSort === 'similar' ? ' visible' : ''}`}>
                  💜 나와 {post.similarity}% 유사
                </div>
              </div>

              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{post.content}</p>
              <p className="post-meta">{post.author} · {post.time}</p>

              <div className="post-divider" />

              <div className="post-actions">
                <button
                  className={`reaction-btn${isReacted(post.id, 'empathy') ? ' reacted' : ''}`}
                  onClick={() => toggleReaction(post.id, 'empathy')}
                >
                  💜 공감 <span className="reaction-count">{getCount(post, 'empathy')}</span>
                </button>

                <button
                  className={`reaction-btn${isReacted(post.id, 'comfort') ? ' reacted' : ''}`}
                  onClick={() => toggleReaction(post.id, 'comfort')}
                >
                  🫂 위로 <span className="reaction-count">{getCount(post, 'comfort')}</span>
                </button>

                <button
                  className={`reaction-btn${isReacted(post.id, 'understand') ? ' reacted' : ''}`}
                  onClick={() => toggleReaction(post.id, 'understand')}
                >
                  🤝 이해돼 <span className="reaction-count">{getCount(post, 'understand')}</span>
                </button>

                <button className="comment-btn">
                  💬 {post.comments}
                </button>

                <button
                  className="similar-link-btn"
                  onClick={() => setActiveFilter(
                    post.emotion.label === '부담감' ? 'burden'
                    : post.emotion.label === '불안' ? 'anxious'
                    : 'tired'
                  )}
                >
                  🔍 비슷한 감정 보기 →
                </button>
              </div>

            </div>
          ))}
        </div>

      </main>

      {/* ── 오른쪽 인사이트 패널 ── */}
      <aside className="community-insight">

        {/* 감정 트렌드 */}
        <div className="insight-card">
          <p className="insight-card-title">📈 지금 감정 트렌드</p>
          {EMOTION_TRENDS.map(t => (
            <div key={t.label} className="trend-item">
              <span className="trend-emotion">{t.emoji} {t.label}</span>
              <div className="trend-bar-bg">
                <div className="trend-bar-fill" style={{ width: `${t.pct}%` }} />
              </div>
              <span className="trend-pct">{t.pct}%</span>
            </div>
          ))}
        </div>

        {/* AI 추천 */}
        <div className="insight-card">
          <p className="insight-card-title">🤖 AI 추천</p>
          <p className="ai-rec-body">
            부담감을 느끼는 분들이 많이 읽고 위로받은 글이에요.
          </p>
          <button className="ai-rec-link">
            "발표 전날 밤은 왜 이렇게 길까" →
          </button>
        </div>

        {/* 인기 글 */}
        <div className="insight-card">
          <p className="insight-card-title">🔥 인기 글</p>
          <div className="popular-list">
            {POPULAR_POSTS.map((title, i) => (
              <div key={i} className="popular-item">
                <span className="popular-rank">{i + 1}</span>
                <span className="popular-title">{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 행동 */}
        <div className="insight-card">
          <p className="insight-card-title">✅ 추천 행동</p>
          <p className="action-context">
            😔 부담감을 느끼는 분들이 효과 있다고 한 행동이에요
          </p>
          <div className="action-list">
            {ACTIONS.map((a, i) => (
              <div key={i} className="action-item">
                <span className="action-icon">{a.icon}</span>
                <span>{a.desc}</span>
              </div>
            ))}
          </div>
          <button className="action-cta" onClick={() => navigate('/write')}>
            📔 일기에 기록하기 →
          </button>
        </div>

      </aside>
      {/* ── 오늘의 추천 글 모달 ── */}
      {showPicks && (
        <div className="picks-overlay" onClick={() => setShowPicks(false)}>
          <div className="picks-modal" onClick={e => e.stopPropagation()}>

            {/* 모달 헤더 */}
            <div className="picks-header">
              <div>
                <h2 className="picks-title">오늘의 추천 글</h2>
                <p className="picks-sub">
                  {CURRENT_EMOTION.emoji} {CURRENT_EMOTION.label} 기준 · 오늘 오후 1시 기준
                </p>
              </div>
              <button className="picks-close" onClick={() => setShowPicks(false)}>✕</button>
            </div>

            {/* 역할 탭 */}
            <div className="picks-tabs">
              {TODAY_PICKS.map((p, i) => (
                <button
                  key={p.id}
                  className={`picks-tab${pickIndex === i ? ' active' : ''}`}
                  onClick={() => setPickIndex(i)}
                >
                  {p.role === '공감' ? '💜' : p.role === '인사이트' ? '💡' : '✅'} {p.role}
                </button>
              ))}
            </div>

            {/* 카드 */}
            {(() => {
              const pick = TODAY_PICKS[pickIndex];
              return (
                <div className="picks-card">
                  <div className="picks-reason">{pick.roleDesc}</div>

                  <div className="picks-card-top">
                    <div className="post-emotion-tag">
                      {pick.emotion.emoji} {pick.emotion.label}
                    </div>
                    <div className="post-similarity visible">
                      💜 나와 {pick.similarity}% 유사
                    </div>
                  </div>

                  <h3 className="picks-post-title">{pick.title}</h3>
                  <p className="picks-post-content">{pick.content}</p>
                  <p className="post-meta">{pick.author} · {pick.time}</p>

                  <div className="post-divider" />

                  <div className="picks-reactions">
                    <span className="reaction-btn">💜 공감 {pick.reactions.empathy}</span>
                    <span className="reaction-btn">🫂 위로 {pick.reactions.comfort}</span>
                    <span className="reaction-btn">🤝 이해돼 {pick.reactions.understand}</span>
                  </div>

                  <div className="picks-action-count">
                    ✅ 이 글을 읽고 행동한 사람 <strong>{pick.actionCount}명</strong>
                  </div>
                </div>
              );
            })()}

            {/* 인디케이터 + 하단 버튼 */}
            <div className="picks-dots">
              {TODAY_PICKS.map((_, i) => (
                <button
                  key={i}
                  className={`picks-dot${pickIndex === i ? ' active' : ''}`}
                  onClick={() => setPickIndex(i)}
                />
              ))}
            </div>

            <div className="picks-footer">
              <button
                className="write-btn"
                style={{ flex: 1 }}
                onClick={() => { setShowPicks(false); setActiveSort('similar'); }}
              >
                피드에서 더 보기 →
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => navigate('/write')}
              >
                📔 일기에 기록하기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityPage;
