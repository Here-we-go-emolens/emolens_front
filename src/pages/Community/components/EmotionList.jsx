export default function EmotionList({ emotions, selectedEmotionLabel, onSelect }) {
  return (
    <div className="emotion-list">
      {emotions.map((emotion) => (
        <button
          key={emotion.label}
          className={`emotion-option ${emotion.tone}${selectedEmotionLabel === emotion.label ? ' active' : ''}`}
          onClick={() => onSelect(emotion)}
        >
          <span>{emotion.emoji}</span>
          <span>{emotion.label}</span>
        </button>
      ))}
    </div>
  );
}
