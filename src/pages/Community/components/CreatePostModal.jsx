import { useEffect, useMemo, useState } from 'react';
import EmotionCategoryTabs from './EmotionCategoryTabs';
import EmotionList from './EmotionList';
import { detectToxicity } from '@/utils/moderation';
import {
  EMOTION_CATEGORIES,
  getEmotionByLabel,
  getEmotionCategoryId,
} from '../communityData';

export default function CreatePostModal({ isOpen, initialEmotionLabel, onClose, onSubmit }) {
  const [emotionLabel, setEmotionLabel] = useState(initialEmotionLabel);
  const [activeCategory, setActiveCategory] = useState(getEmotionCategoryId(initialEmotionLabel));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setEmotionLabel(initialEmotionLabel);
    setActiveCategory(getEmotionCategoryId(initialEmotionLabel));
    setTitle('');
    setContent('');
  }, [initialEmotionLabel, isOpen]);

  const currentCategoryEmotions = useMemo(
    () => EMOTION_CATEGORIES.find((category) => category.id === activeCategory)?.emotions ?? [],
    [activeCategory],
  );
  const moderation = useMemo(() => detectToxicity(`${title} ${content}`), [title, content]);

  if (!isOpen) return null;

  const selectedEmotion = getEmotionByLabel(emotionLabel);
  const canSubmit = title.trim() && content.trim();

  return (
    <div className="create-post-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-post-head">
          <div>
            <span className="create-post-kicker">지금 내 감정 기록하기</span>
            <h2>지금 떠오르는 마음을 바로 남겨보세요</h2>
          </div>
          <button className="create-post-close" onClick={onClose}>✕</button>
        </div>

        <div className="create-post-section">
          <span className="create-post-label">감정 선택</span>
          <EmotionCategoryTabs
            categories={EMOTION_CATEGORIES}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
          <EmotionList
            emotions={currentCategoryEmotions}
            selectedEmotionLabel={emotionLabel}
            onSelect={(emotion) => setEmotionLabel(emotion.label)}
          />
        </div>

        <div className="create-post-section">
          <label className="create-post-label" htmlFor="community-post-title">제목</label>
          <input
            id="community-post-title"
            className="create-post-input"
            placeholder="지금 마음을 가장 잘 보여주는 한 줄"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="create-post-section">
          <label className="create-post-label" htmlFor="community-post-content">내용</label>
          <textarea
            id="community-post-content"
            className="create-post-textarea"
            placeholder="무슨 일이 있었는지, 어떤 감정이 드는지 편하게 적어보세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          {moderation.status !== 'safe' && (title.trim() || content.trim()) && (
            <p className={`create-post-moderation ${moderation.status}`}>{moderation.message}</p>
          )}
        </div>

        <div className="create-post-preview">
          <span className={`post-emotion-tag ${selectedEmotion.tone}`}>
            {selectedEmotion.emoji} {selectedEmotion.label}
          </span>
          <p>등록하면 지금 커뮤니티 피드에 바로 반영돼요.</p>
        </div>

        <div className="create-post-actions">
          <button className="create-post-secondary" onClick={onClose}>닫기</button>
          <button
            className="create-post-primary"
            disabled={!canSubmit || moderation.status === 'warning' || moderation.status === 'blocked' || moderation.status === 'hidden'}
            onClick={() =>
              onSubmit({
                emotion: selectedEmotion,
                title: title.trim(),
                content: content.trim(),
              })
            }
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
