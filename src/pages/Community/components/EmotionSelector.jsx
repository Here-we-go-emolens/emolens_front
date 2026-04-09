import { useMemo, useState } from 'react';
import EmotionCategoryTabs from './EmotionCategoryTabs';
import EmotionList from './EmotionList';
import {
  EMOTION_CATEGORIES,
  getEmotionCategoryId,
} from '../communityData';

export default function EmotionSelector({ currentEmotion, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(getEmotionCategoryId(currentEmotion.label));

  const currentCategoryEmotions = useMemo(
    () => EMOTION_CATEGORIES.find((category) => category.id === activeCategory)?.emotions ?? [],
    [activeCategory],
  );

  return (
    <>
      <div className="community-hero-emotion">
        <span className="hero-emotion-label">지금 많이 보이는 감정</span>
        <strong>{currentEmotion.emoji} {currentEmotion.label}</strong>
        <span>{currentEmotion.pct}%</span>
        <button
          className="btn-change-emotion"
          onClick={() => {
            setActiveCategory(getEmotionCategoryId(currentEmotion.label));
            setIsOpen(true);
          }}
        >
          감정 바꾸기
        </button>
      </div>

      {isOpen && (
        <div className="emotion-picker-overlay" onClick={() => setIsOpen(false)}>
          <div className="emotion-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emotion-picker-head">
              <div>
                <span className="emotion-picker-kicker">감정 선택</span>
                <h2>지금 가장 가까운 감정을 골라보세요</h2>
              </div>
              <button className="emotion-picker-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <EmotionCategoryTabs
              categories={EMOTION_CATEGORIES}
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />

            <EmotionList
              emotions={currentCategoryEmotions}
              selectedEmotionLabel={currentEmotion.label}
              onSelect={(emotion) => {
                onSelect(emotion);
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
