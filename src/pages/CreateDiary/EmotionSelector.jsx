import { useState, useRef, useEffect } from 'react';
import { BASIC_EMOTION_IDS, EXTENDED_EMOTION_IDS } from '@/constants/emotions';
import { getPersonalizedBasicIds } from '@/utils/emotionUsage';
import EmotionCard from './EmotionCard';
import EmotionIntensitySlider from './EmotionIntensitySlider';

const MAX_EMOTIONS = 3;

export default function EmotionSelector({ selectedEmotions, onToggle, onScoreChange, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  const personalizedBasic = getPersonalizedBasicIds(BASIC_EMOTION_IDS, EXTENDED_EMOTION_IDS);
  const demotedBasic = BASIC_EMOTION_IDS.filter(id => !personalizedBasic.includes(id));
  const extendedDisplay = [
    ...EXTENDED_EMOTION_IDS.filter(id => !personalizedBasic.includes(id)),
    ...demotedBasic,
  ];

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = () => {
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500);
  };

  const handleCardClick = (id) => {
    const alreadySelected = selectedEmotions.some(e => e.id === id);
    if (!alreadySelected && selectedEmotions.length >= MAX_EMOTIONS) {
      showToast();
      return;
    }
    onToggle(id);
  };

  const getOrder = (id) => {
    const found = selectedEmotions.find(e => e.id === id);
    return found ? found.order : 0;
  };

  return (
    <section className="dw-emotion-section">
      {/* 토스트 */}
      <div className={`es-toast${toastVisible ? ' visible' : ''}`} role="alert" aria-live="polite">
        감정은 최대 3개까지 선택할 수 있어요
      </div>

      <div className="dw-emotion-header">
        <span className="dw-emotion-q">지금 어떤 감정인가요?</span>
        {selectedEmotions.length > 0 && (
          <button className="dw-emotion-clear" onClick={onClear}>초기화</button>
        )}
      </div>

      {/* 기본 8개 그리드 */}
      <div className="dw-emotion-grid">
        {personalizedBasic.map(id => (
          <EmotionCard key={id} id={id} order={getOrder(id)} onClick={handleCardClick} />
        ))}
      </div>

      {/* 더보기 버튼 */}
      <button
        className={`es-expand-btn${expanded ? ' expanded' : ''}`}
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        aria-controls="es-extended-region"
      >
        더 많은 감정 보기
        <svg
          className="es-expand-arrow"
          width="14" height="14"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* 확장 영역 */}
      <div
        id="es-extended-region"
        className={`es-extended-wrap${expanded ? ' open' : ''}`}
      >
        <div className="es-extended-inner">
          <div className="dw-emotion-grid">
            {extendedDisplay.map(id => (
              <EmotionCard key={id} id={id} order={getOrder(id)} onClick={handleCardClick} />
            ))}
          </div>
        </div>
      </div>

      {/* 강도 슬라이더 */}
      {selectedEmotions.length > 0 && (
        <div className="es-sliders">
          <span className="es-sliders-label">감정 강도를 조절해보세요</span>
          {[...selectedEmotions]
            .sort((a, b) => a.order - b.order)
            .map(({ id, score }) => (
              <EmotionIntensitySlider key={id} id={id} score={score} onChange={onScoreChange} />
            ))}
        </div>
      )}
    </section>
  );
}
