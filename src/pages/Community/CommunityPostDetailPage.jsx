import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import CommentSection from './components/CommentSection';
import PostReactionBar from './components/PostReactionBar';
import { useCommunity } from './CommunityContext';
import '@/styles/Home/Home.css';
import '@/styles/Community/CommunityPage.css';

export default function CommunityPostDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const {
    posts,
    setSelectedEmotionLabel,
    getComments,
    addComment,
    toggleReaction,
    isReacted,
    getReactionCount,
  } = useCommunity();
  const commentsRef = useRef(null);

  const post = useMemo(
    () => posts.find((item) => String(item.id) === String(id)),
    [id, posts],
  );
  const comments = getComments(Number(id));

  useEffect(() => {
    if (location.hash === '#comments') {
      commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, post]);

  if (!post) {
    return (
      <div className="home-layout">
        <SidebarLeft />
        <main className="main-content">
          <div className="card community-detail-card">
            <p className="community-detail-empty">해당 커뮤니티 글을 찾을 수 없어요.</p>
            <button className="btn-secondary" onClick={() => navigate('/community')}>
              커뮤니티로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-layout">
      <SidebarLeft />

      <main className="main-content">
        <div className="card community-detail-card">
          <div className="community-detail-top">
            <button className="community-detail-back" onClick={() => navigate('/community')}>
              ← 커뮤니티로 돌아가기
            </button>
            <div className={`post-emotion-tag ${post.emotion.tone}`}>
              {post.emotion.emoji} {post.emotion.label}
            </div>
          </div>

          <h1 className="community-detail-title">{post.title}</h1>

          <div className="post-meta-row detail">
            <span className="post-meta">{post.author} · {post.time}</span>
            <span className="post-match-reason">{post.matchReason}</span>
          </div>

          <div className="post-tag-row detail">
            {post.tags.map((tag) => (
              <span key={tag} className="post-hashtag">#{tag}</span>
            ))}
          </div>

          <div className="community-detail-content">
            {post.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          <div className="post-divider" />

          <PostReactionBar
            post={post}
            isReacted={isReacted}
            getCount={getReactionCount}
            onToggleReaction={toggleReaction}
            onCommentClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            onSimilarEmotion={() => {
              setSelectedEmotionLabel(post.emotion.label);
              navigate('/community');
            }}
          />
        </div>

        <CommentSection
          comments={comments}
          sectionRef={commentsRef}
          onSubmit={(content) => addComment(post.id, content)}
        />
      </main>
    </div>
  );
}
