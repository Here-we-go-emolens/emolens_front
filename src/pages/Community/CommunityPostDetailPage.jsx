import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import CommentSection from './components/CommentSection';
import PostReactionBar from './components/PostReactionBar';
import { useCommunity } from './CommunityContext';
import { getPost, getComments, createComment, deleteComment, updatePost, deletePost } from '@/services/communityApi';
import { getEmotionByLabel } from './communityData';
import '@/styles/Home/Home.css';
import '@/styles/Community/CommunityPage.css';

export default function CommunityPostDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { setSelectedEmotionLabel, toggleReaction, isReacted, getReactionCount, setReactionStateFromPost } = useCommunity();
  const commentsRef = useRef(null);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([getPost(id), getComments(id)])
      .then(([postData, commentsData]) => {
        setPost({ ...postData, emotion: getEmotionByLabel(postData.emotionLabel), author: postData.authorName });
        setComments(commentsData);
        setReactionStateFromPost(postData);
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
    try {
      await createComment(id, content, isHidden);
      const updated = await getComments(id);
      setComments(updated);
    } catch {
      alert('댓글 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠어요?')) return;
    try {
      await deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('게시글을 삭제하시겠어요?')) return;
    try {
      await deletePost(id);
      navigate('/community');
    } catch {
      alert('게시글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleEditStart = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    try {
      await updatePost(id, { title: editTitle.trim(), content: editContent.trim(), emotionLabel: post.emotionLabel, tags: post.tags });
      setPost((prev) => ({ ...prev, title: editTitle.trim(), content: editContent.trim() }));
      setIsEditing(false);
    } catch {
      alert('게시글 수정에 실패했습니다. 다시 시도해주세요.');
    }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className={`post-emotion-tag ${post.emotion.tone}`}>
                {post.emotion.emoji} {post.emotion.label}
              </div>
              {post.isMine && !isEditing && (
                <>
                  <button className="community-detail-action-btn" onClick={handleEditStart}>수정</button>
                  <button className="community-detail-action-btn danger" onClick={handleDeletePost}>삭제</button>
                </>
              )}
              {isEditing && (
                <>
                  <button className="community-detail-action-btn" onClick={handleEditSave}>저장</button>
                  <button className="community-detail-action-btn" onClick={() => setIsEditing(false)}>취소</button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="community-detail-edit-form">
              <input
                className="community-detail-edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="제목"
              />
              <textarea
                className="community-detail-edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                placeholder="내용을 입력하세요"
              />
            </div>
          ) : (
            <h1 className="community-detail-title">{post.title}</h1>
          )}

          <div className="post-meta-row detail">
            <span className="post-meta">{post.authorName}</span>
          </div>

          <div className="post-tag-row detail">
            {post.tags?.map((tag) => (
              <span key={tag} className="post-hashtag">#{tag}</span>
            ))}
          </div>

          {!isEditing && (
            <div className="community-detail-content">
              {(post.content ?? '').split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}

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
          onDelete={handleDeleteComment}
        />
      </main>
    </div>
  );
}
