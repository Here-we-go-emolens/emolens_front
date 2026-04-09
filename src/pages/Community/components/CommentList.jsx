import CommentItem from './CommentItem';

export default function CommentList({ comments }) {
  if (!comments.length) {
    return <p className="comment-empty">첫 댓글로 마음을 나눠보세요.</p>;
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
