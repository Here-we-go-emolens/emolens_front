import { useState } from 'react';
import { findEmotionById, SLIDER_COLOR } from '@/constants/emotions';

export default function EmotionIntensitySlider({ id, score, onChange }) {
  const [imgError, setImgError] = useState(false);
  const e = findEmotionById(id);
  const color = SLIDER_COLOR[e.category];

  return (
    <div className="es-slider-row">
      <div className="es-slider-label-row">
        {imgError ? (
          <div className="es-slider-img-fallback" aria-hidden="true" />
        ) : (
          <img
            src={e.image}
            alt=""
            className="es-slider-img"
            onError={() => setImgError(true)}
            draggable={false}
          />
        )}
        <span className="es-slider-name">{e.label}</span>
        <span className="es-slider-value" style={{ color }}>{score}</span>
      </div>
      <div className="es-slider-track-wrap">
        <span className="es-slider-hint">약함</span>
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={ev => onChange(id, Number(ev.target.value))}
          className="es-slider"
          style={{ '--slider-color': color }}
          aria-label={`${e.label} 강도`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
        />
        <span className="es-slider-hint">강함</span>
      </div>
    </div>
  );
}
