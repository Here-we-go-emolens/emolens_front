import { useMemo, useState } from 'react';
import { detectToxicity } from '@/utils/moderation';

export default function CommentInput({ onSubmit }) {
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState(null);

  const moderation = useMemo(() => detectToxicity(value), [value]);

  const handleSubmit = async () => {
    if (!value.trim() || moderation.status === 'blocked') return;

    const isHidden = moderation.status === 'hidden';
    await onSubmit(value.trim(), isHidden);

    setFeedback(
      isHidden
        ? { status: 'hidden', message: '공격적 표현이 감지되어 댓글이 숨김 처리되었어요.' }
        : null,
    );
    setValue('');
  };

  return (
    <div className="comment-input-card">
      <textarea
        className="comment-textarea"
        placeholder="이 글에 공감하거나 전하고 싶은 말을 남겨보세요"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
      />

      <div className="comment-input-footer">
        <div className="comment-guidance">
          <p>비하, 욕설, 공격적 표현은 자동으로 제한될 수 있어요.</p>
          {moderation.status !== 'safe' && value.trim() && (
            <p className={`comment-moderation-message ${moderation.status}`}>{moderation.message}</p>
          )}
          {feedback && (
            <p className={`comment-moderation-message ${feedback.status}`}>{feedback.message}</p>
          )}
        </div>

        <button
          className="comment-submit-btn"
          onClick={handleSubmit}
          disabled={moderation.status === 'blocked'}
        >
          등록하기
        </button>
      </div>
    </div>
  );
}
