export default function CommentItem({ comment }) {
  if (comment.isHidden) {
    return (
      <div className="comment-item hidden">
        <p className="comment-hidden-message">이 댓글은 커뮤니티 가이드에 따라 숨김 처리되었어요.</p>
      </div>
    );
  }

  return (
    <div className="comment-item">
      <div className="comment-meta">
        <span className="comment-author">{comment.author}</span>
        <span className="comment-time">{comment.createdAt}</span>
      </div>
      <p className="comment-content">{comment.content}</p>
    </div>
  );
}
