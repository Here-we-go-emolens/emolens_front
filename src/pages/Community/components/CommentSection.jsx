import CommentInput from './CommentInput';
import CommentList from './CommentList';

export default function CommentSection({ comments, onSubmit, sectionRef }) {
  return (
    <section className="card comment-section" ref={sectionRef} id="comments">
      <div className="comment-section-head">
        <div>
          <span className="comment-section-kicker">댓글</span>
          <h2>이야기를 이어가 보세요</h2>
        </div>
        <span className="comment-count-badge">{comments.length}개</span>
      </div>

      <CommentList comments={comments} />
      <CommentInput onSubmit={onSubmit} />
    </section>
  );
}
