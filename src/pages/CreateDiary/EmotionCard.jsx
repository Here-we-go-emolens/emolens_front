import { useState } from 'react';
import { findEmotionById } from '@/constants/emotions';

const ORDER_LABELS = ['', '①', '②', '③'];

export default function EmotionCard({ id, order, onClick }) {
  const [imgError, setImgError] = useState(false);
  const e = findEmotionById(id);
  const selected = order > 0;

  return (
    <button
      className={`ec-card${selected ? ` selected order-${order}` : ''}`}
      onClick={() => onClick(id)}
      aria-pressed={selected}
      aria-label={`${e.label}${selected ? ` 선택됨 ${ORDER_LABELS[order]}` : ''}`}
    >
      {selected && (
        <span className="ec-order-badge" aria-hidden="true">
          {ORDER_LABELS[order]}
        </span>
      )}

      <div className="ec-image-wrap">
        {imgError ? (
          <div className="ec-image-fallback" aria-hidden="true" />
        ) : (
          <img
            src={e.image}
            alt=""
            className="ec-image"
            onError={() => setImgError(true)}
            draggable={false}
          />
        )}
      </div>

      <span className="ec-label">{e.label}</span>
    </button>
  );
}
