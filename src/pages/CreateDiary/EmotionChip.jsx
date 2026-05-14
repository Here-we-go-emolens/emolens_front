import { EMOTION_MAP } from '@/constants/emotions';

const ORDER_LABELS = ['', '①', '②', '③'];

export default function EmotionChip({ id, order, onClick }) {
  const e = EMOTION_MAP[id];
  const selected = order > 0;

  if (!e) return null;

  return (
    <button
      className={`emotion-chip${selected ? ' selected' : ''}`}
      style={{
        '--chip-bg':     e.bg,
        '--chip-border': e.border,
        '--chip-glow':   e.glow,
      }}
      onClick={() => onClick(id)}
      aria-pressed={selected}
    >
      {selected && <span className="chip-order-badge">{ORDER_LABELS[order]}</span>}
      <span className="chip-emoji">{e.emoji}</span>
      <span className="chip-label">{e.label}</span>
    </button>
  );
}
