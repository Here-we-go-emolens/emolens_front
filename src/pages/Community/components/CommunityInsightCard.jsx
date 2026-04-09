export default function CommunityInsightCard({ insight }) {
  return (
    <section className="insight-card community-insight-card">
      <div className="community-insight-head">
        <div className="community-insight-icon">🤖</div>
        <div>
          <p className="insight-card-title">{insight.badge}</p>
          <h2 className="community-insight-title">지금 커뮤니티에서 읽히는 감정 흐름</h2>
        </div>
      </div>

      <div className="community-insight-stack">
        <div className="community-insight-line">
          <span className="community-insight-line-label">핵심 감정</span>
          <p>{insight.summary}</p>
        </div>

        <div className="community-insight-line">
          <span className="community-insight-line-label">자주 나타나는 상황</span>
          <p>{insight.context}</p>
        </div>
      </div>

      <div className="community-insight-actions">
        <span className="community-insight-line-label">AI 추천 행동</span>
        <div className="community-insight-action-list">
          {insight.actions.map((item) => (
            <span key={item} className="community-insight-action-chip">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
