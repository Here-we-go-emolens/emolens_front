import PostReactionBar from './PostReactionBar';

export default function PostCard({
  post,
  showSimilarity,
  isReacted,
  getCount,
  onToggleReaction,
  onSimilarEmotion,
  onCommentClick,
  onOpenPost,
}) {
  return (
    <article
      className="card post-card"
      role="button"
      tabIndex={0}
      onClick={onOpenPost}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenPost();
        }
      }}
    >
      <div className="post-card-top">
        <div className={`post-emotion-tag ${post.emotion.tone}`}>
          {post.emotion.emoji} {post.emotion.label}
        </div>
        <div className={`post-similarity${showSimilarity ? ' visible' : ''}`}>
          AI 연결도 {post.similarity}%
        </div>
      </div>

      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>

      <div className="post-tag-row">
        {post.tags.map((tag) => (
          <span key={tag} className="post-hashtag">#{tag}</span>
        ))}
      </div>

      <div className="post-meta-row">
        <span className="post-meta">{post.author} · {post.time}</span>
        <span className="post-match-reason">{post.matchReason}</span>
      </div>

      <div className="post-divider" />

      <PostReactionBar
        post={post}
        isReacted={isReacted}
        getCount={getCount}
        onToggleReaction={onToggleReaction}
        onSimilarEmotion={onSimilarEmotion}
        onCommentClick={onCommentClick}
      />
    </article>
  );
}
