import { EMOTION_MAP, SLIDER_COLOR } from '@/constants/emotions';

export default function EmotionIntensitySlider({ id, score, onChange }) {
  const e = EMOTION_MAP[id];
  const color = SLIDER_COLOR[e.category];

  return (
    <div className="es-slider-row">
      <div className="es-slider-label-row">
        <span className="es-slider-emoji">{e.emoji}</span>
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
        />
        <span className="es-slider-hint">강함</span>
      </div>
    </div>
  );
}
