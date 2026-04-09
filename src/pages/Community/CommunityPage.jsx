import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import CommunityInsightCard from './components/CommunityInsightCard';
import CommunityActionPanel from './components/CommunityActionPanel';
import CreatePostModal from './components/CreatePostModal';
import EmotionSelector from './components/EmotionSelector';
import PostCard from './components/PostCard';
import { useCommunity } from './CommunityContext';
import {
  EMOTION_FILTERS,
  SORT_OPTIONS,
  TODAY_PICKS,
  getEmotionByLabel,
  getFilterFromEmotion,
} from './communityData';
import '@/styles/Home/Home.css';
import '@/styles/Community/CommunityPage.css';

const RECOMMENDED_ACTIONS = [
  {
    id: 'record',
    icon: '✍️',
    title: '지금 내 감정 기록하기',
    desc: '지금 떠오르는 감정을 짧게 적고 AI 분석으로 바로 이어가세요.',
    tone: 'primary',
  },
  {
    id: 'similar',
    icon: '💞',
    title: '비슷한 글만 모아보기',
    desc: '현재 느끼는 감정과 가장 가까운 경험담을 먼저 보여드려요.',
    tone: 'soft',
  },
  {
    id: 'guide',
    icon: '🤖',
    title: 'AI 추천 행동 보기',
    desc: '같은 감정을 겪은 사람들이 실제로 선택한 행동을 확인해보세요.',
    tone: 'soft',
  },
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const {
    posts,
    selectedEmotion,
    selectedFilter,
    aiInsight,
    setSelectedEmotionLabel,
    createPost,
    toggleReaction,
    isReacted,
    getReactionCount,
  } = useCommunity();

  const [activeFilter, setActiveFilter] = useState(selectedFilter);
  const [activeSort, setActiveSort] = useState('latest');
  const [showPicks, setShowPicks] = useState(false);
  const [pickIndex, setPickIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        if (activeFilter === 'all') return true;
        return post.emotion.filterId === activeFilter;
      }),
    [activeFilter, posts],
  );

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (activeSort === 'empathy') {
        return getReactionCount(b, 'empathy') - getReactionCount(a, 'empathy');
      }
      if (activeSort === 'similar') {
        return b.similarity - a.similarity;
      }
      return b.id - a.id;
    });
  }, [activeSort, filteredPosts, getReactionCount]);

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotionLabel(emotion.label);
    setActiveFilter(emotion.filterId);
    setActiveSort('similar');
  };

  const handleAction = (actionId) => {
    if (actionId === 'record') {
      setShowCreateModal(true);
      return;
    }

    if (actionId === 'similar') {
      setActiveFilter(selectedEmotion.filterId);
      setActiveSort('similar');
      return;
    }

    setPickIndex(2);
    setShowPicks(true);
  };

  const handleCreatePost = ({ emotion, title, content }) => {
    createPost({ emotion, title, content });
    setActiveFilter(emotion.filterId);
    setActiveSort('latest');
    setShowCreateModal(false);
  };

  return (
    <div className="home-layout">
      <SidebarLeft />

      <main className="main-content" style={{ gap: 0 }}>
        <div className="card community-hero">
          <div className="community-hero-top">
            <div>
              <span className="community-hero-kicker">AI 기반 감정 연결 커뮤니티</span>
              <h1 className="community-hero-title">EchoLens에서 지금 마음과 가장 가까운 이야기를 만나보세요</h1>
              <p className="community-hero-sub">
                감정을 읽고 끝나는 공간이 아니라, 공감하고 위로하고 다음 행동까지 이어지는 참여형 커뮤니티예요.
              </p>
            </div>
            <EmotionSelector currentEmotion={selectedEmotion} onSelect={handleEmotionSelect} />
          </div>
        </div>

        <CommunityActionPanel actions={RECOMMENDED_ACTIONS} onAction={handleAction} />

        <div className="card community-filter">
          <div className="filter-chips-row">
            {EMOTION_FILTERS.map((filter) => (
              <button
                key={filter.id}
                className={`filter-chip${activeFilter === filter.id ? ' active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.emoji && `${filter.emoji} `}
                {filter.label}
              </button>
            ))}
          </div>

          <div className="sort-row">
            <span className="sort-label">정렬</span>
            {SORT_OPTIONS.map((sort) => (
              <button
                key={sort.id}
                className={`sort-btn${activeSort === sort.id ? ' active' : ''}`}
                onClick={() => setActiveSort(sort.id)}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        <div className="community-content-grid">
          <section className="post-feed">
            <div className="similarity-context in-feed">
              AI가 현재 감정과 가장 유사한 글부터 보여주고 있어요
            </div>

            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showSimilarity={activeSort === 'similar'}
                isReacted={isReacted}
                getCount={getReactionCount}
                onToggleReaction={toggleReaction}
                onSimilarEmotion={() => {
                  setSelectedEmotionLabel(post.emotion.label);
                  setActiveFilter(post.emotion.filterId);
                  setActiveSort('similar');
                }}
                onCommentClick={() => navigate(`/community/${post.id}#comments`)}
                onOpenPost={() => navigate(`/community/${post.id}`)}
              />
            ))}
          </section>

          <aside className="community-insight">
            <CommunityInsightCard insight={aiInsight} />

            <div className="insight-card community-ai-guide">
              <p className="insight-card-title">감정 연결 흐름</p>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="guide-step-icon">1</span>
                  <div>
                    <strong>감정 고르기</strong>
                    <p>상단에서 지금 마음과 가까운 감정을 선택해 흐름을 바꿔보세요.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="guide-step-icon">2</span>
                  <div>
                    <strong>반응 남기기</strong>
                    <p>공감, 위로, 이해, 이야기 나누기로 바로 참여할 수 있어요.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="guide-step-icon">3</span>
                  <div>
                    <strong>기록 이어가기</strong>
                    <p>내 감정을 적으면 커뮤니티 피드에 바로 반영돼요.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <CreatePostModal
        isOpen={showCreateModal}
        initialEmotionLabel={selectedEmotion.label}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />

      {showPicks && (
        <div className="picks-overlay" onClick={() => setShowPicks(false)}>
          <div className="picks-modal" onClick={(e) => e.stopPropagation()}>
            <div className="picks-header">
              <div>
                <h2 className="picks-title">AI가 연결한 추천 글</h2>
                <p className="picks-sub">
                  {selectedEmotion.emoji} {selectedEmotion.label} 기준 · 지금 가장 반응이 이어지는 흐름
                </p>
              </div>
              <button className="picks-close" onClick={() => setShowPicks(false)}>✕</button>
            </div>

            <div className="picks-tabs">
              {TODAY_PICKS.map((pick, index) => (
                <button
                  key={pick.id}
                  className={`picks-tab${pickIndex === index ? ' active' : ''}`}
                  onClick={() => setPickIndex(index)}
                >
                  {pick.role === '공감' ? '💜' : pick.role === '인사이트' ? '💡' : '✅'} {pick.role}
                </button>
              ))}
            </div>

            {(() => {
              const pick = TODAY_PICKS[pickIndex];
              const emotion = getEmotionByLabel(pick.emotionLabel);
              return (
                <div className="picks-card">
                  <div className="picks-reason">{pick.roleDesc}</div>

                  <div className="picks-card-top">
                    <div className={`post-emotion-tag ${emotion.tone}`}>
                      {emotion.emoji} {emotion.label}
                    </div>
                    <div className="post-similarity visible">
                      AI 연결도 {pick.similarity}%
                    </div>
                  </div>

                  <h3 className="picks-post-title">{pick.title}</h3>
                  <p className="picks-post-content">{pick.content}</p>
                  <p className="post-meta">{pick.author} · {pick.time}</p>

                  <div className="post-divider" />

                  <div className="picks-reactions">
                    <span className="reaction-btn">💜 공감해요 {pick.reactions.empathy}</span>
                    <span className="reaction-btn">🫂 위로할게요 {pick.reactions.comfort}</span>
                    <span className="reaction-btn">🤝 이해돼요 {pick.reactions.understand}</span>
                    <span className="comment-btn">💬 이야기 나누기 {pick.reactions.comment}</span>
                  </div>

                  <div className="picks-action-count">
                    ✅ 이 글을 읽고 행동을 남긴 사람 <strong>{pick.actionCount}명</strong>
                  </div>
                </div>
              );
            })()}

            <div className="picks-dots">
              {TODAY_PICKS.map((_, index) => (
                <button
                  key={index}
                  className={`picks-dot${pickIndex === index ? ' active' : ''}`}
                  onClick={() => setPickIndex(index)}
                />
              ))}
            </div>

            <div className="picks-footer">
              <button
                className="write-btn"
                style={{ flex: 1 }}
                onClick={() => {
                  setShowPicks(false);
                  setActiveFilter(getFilterFromEmotion(selectedEmotion.label));
                  setActiveSort('similar');
                }}
              >
                피드에서 더 보기 →
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowCreateModal(true)}
              >
                📔 내 감정 기록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
