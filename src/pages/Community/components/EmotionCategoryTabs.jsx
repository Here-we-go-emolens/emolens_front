export default function EmotionCategoryTabs({ categories, activeCategory, onChange }) {
  return (
    <div className="emotion-category-tabs">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`emotion-category-tab${activeCategory === category.id ? ' active' : ''}`}
          onClick={() => onChange(category.id)}
        >
          {category.emoji} {category.label}
        </button>
      ))}
    </div>
  );
}
