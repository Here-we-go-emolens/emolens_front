import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import CommentSection from './components/CommentSection';
import PostReactionBar from './components/PostReactionBar';
import { useCommunity } from './CommunityContext';
import { getPost, getComments, createComment } from '@/services/communityApi';
import { getEmotionByLabel } from './communityData';
import '@/styles/Home/Home.css';
import '@/styles/Community/CommunityPage.css';

export default function CommunityPostDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { setSelectedEmotionLabel, toggleReaction, isReacted, getReactionCount } = useCommunity();
  const commentsRef = useRef(null);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPost(id), getComments(id)])
      .then(([postData, commentsData]) => {
        setPost({ ...postData, emotion: getEmotionByLabel(postData.emotionLabel), author: postData.authorName });
        setComments(commentsData);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (location.hash === '#comments' && commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, loading]);

  const handleAddComment = async (content, isHidden = false) => {
    await createComment(id, content, isHidden);
    const updated = await getComments(id);
    setComments(updated);
  };

  const handleToggleReaction = async (postId, type) => {
    const result = await toggleReaction(postId, type);
    if (result) {
      setPost((prev) => ({
        ...prev,
        reactions: { ...prev.reactions, [type]: result.count },
      }));
    }
  };

  if (loading) {
    return (
      <div className="home-layout">
        <SidebarLeft />
        <main className="main-content">
          <div className="card community-detail-card">
            <p className="community-detail-empty">불러오는 중...</p>
          </div>
        </main>
      </div>
    );
  }

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
            <span className="post-meta">{post.authorName}</span>
          </div>

          <div className="post-tag-row detail">
            {post.tags?.map((tag) => (
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
            onToggleReaction={handleToggleReaction}
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
          onSubmit={handleAddComment}
        />
      </main>
    </div>
  );
}
