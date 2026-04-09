export default function CommunityActionPanel({ actions, onAction }) {
  return (
    <section className="community-action-panel">
      <div className="community-action-copy">
        <span className="community-action-kicker">참여 액션</span>
        <h2>지금 감정을 읽는 데서 끝내지 말고, 바로 반응으로 이어가보세요</h2>
        <p>기록하기, 비슷한 감정 보기, 추천 행동 확인까지 한 흐름으로 움직일 수 있게 구성했어요.</p>
      </div>

      <div className="community-action-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`community-action-card ${action.tone}`}
            onClick={() => onAction(action.id)}
          >
            <span className="community-action-icon">{action.icon}</span>
            <strong>{action.title}</strong>
            <span>{action.desc}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
