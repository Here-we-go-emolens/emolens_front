const REACTION_ITEMS = [
  { type: 'empathy', icon: '💜', label: '공감해요' },
  { type: 'comfort', icon: '🫂', label: '위로할게요' },
  { type: 'understand', icon: '🤝', label: '이해돼요' },
  { type: 'comment', icon: '💬', label: '이야기 나누기', buttonClass: 'comment-btn' },
];

export default function PostReactionBar({
  post,
  isReacted,
  getCount,
  onToggleReaction,
  onSimilarEmotion,
  onCommentClick,
}) {
  return (
    <div className="post-actions">
      {REACTION_ITEMS.map((item) => (
        <button
          key={item.type}
          className={`${item.buttonClass ?? 'reaction-btn'}${isReacted(post.id, item.type) ? ' reacted' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (item.type === 'comment') {
              onCommentClick?.();
              return;
            }
            onToggleReaction(post.id, item.type);
          }}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
          <span className="reaction-count">{getCount(post, item.type)}</span>
        </button>
      ))}

      <button
        className="similar-link-btn"
        onClick={(e) => {
          e.stopPropagation();
          onSimilarEmotion();
        }}
      >
        비슷한 감정 보기
      </button>
    </div>
  );
}
