import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMOTION_MAP } from '@/constants/emotions';
import mascotImg from '@/assets/mascot-removebg-preview.png';
import "@/styles/Sidebar-right/SidebarRight.css";

const EmotionPanel = ({ stats, diaries = [], monthStr, characterName }) => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos]   = useState({ top: 0, right: 0 });
  const stabilityRef = useRef(null);

  const streak         = stats?.summary?.streak         ?? 0;
  const diaryCount     = stats?.summary?.diaryCount      ?? 0;
  const stabilityScore = stats?.summary?.stabilityScore  ?? 0;

  const daysInMonth = useMemo(() => {
    if (!monthStr) return 31;
    const [y, m] = monthStr.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }, [monthStr]);

  const weeklyEmotions = useMemo(() => {
    const today   = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);
    const todayStr   = today.toISOString().slice(0, 10);

    const counts = {};
    diaries
      .filter(d => d.diaryDate >= weekAgoStr && d.diaryDate <= todayStr)
      .forEach(d => {
        (d.userEmotions ?? []).forEach(e => {
          counts[e.emotion] = (counts[e.emotion] ?? 0) + 1;
        });
      });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, count]) => ({ id, count, ...(EMOTION_MAP[id] ?? { label: id }) }));
  }, [diaries]);

  const progressPct = Math.min(100, Math.round((diaryCount / daysInMonth) * 100));

  const stabilityComment =
    stabilityScore >= 80 ? '이번 달 감정이 매우 안정적이에요. 잘 하고 있어요!' :
    stabilityScore >= 60 ? '감정이 비교적 균형을 잘 유지하고 있어요.' :
    stabilityScore >= 40 ? '감정 기복이 조금 있었던 달이에요. 괜찮아요.' :
    '이번 달 감정 변화가 많았네요. 천천히 돌아봐요.';

  return (
    <div className="sidebar-right">
      <h3 className="ep-title">나의 감정 현황</h3>

      <div className="ep-section ep-streak">
        <span className="ep-streak-icon">🔥</span>
        <div className="ep-streak-text">
          <span className="ep-streak-num">{streak}일</span>
          <span className="ep-streak-label">연속 기록 중</span>
        </div>
      </div>

      <div className="ep-section">
        <div className="ep-section-head">이번 주 감정</div>
        {weeklyEmotions.length === 0 ? (
          <p className="ep-empty">이번 주 일기가 없어요</p>
        ) : (
          <div className="ep-emotion-list">
            {weeklyEmotions.map(em => (
              <div key={em.id} className="ep-emotion-row">
                {em.image
                  ? <img src={em.image} alt={em.label} className="ep-emotion-img" />
                  : <span className="ep-emotion-dot" style={{ background: em.border ?? '#ccc' }} />
                }
                <span className="ep-emotion-label">{em.label}</span>
                <span className="ep-emotion-count">{em.count}회</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ep-section">
        <div className="ep-section-head">이번 달 작성</div>
        <div className="ep-progress-bar-wrap">
          <div className="ep-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="ep-progress-label">{diaryCount} / {daysInMonth}일</div>
      </div>

      {stabilityScore > 0 && (
        <div
          ref={stabilityRef}
          className="ep-section ep-stability"
          onMouseEnter={() => {
            if (stabilityRef.current) {
              const rect = stabilityRef.current.getBoundingClientRect();
              setTooltipPos({
                top:   rect.bottom - 80,
                right: window.innerWidth - rect.left + 12,
              });
            }
            setShowTooltip(true);
          }}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="ep-stability-label-wrap">
            <span className="ep-stability-label">감정 안정도</span>
            <span className="ep-stability-hint">?</span>
          </div>
          <span className="ep-stability-val">{stabilityScore}%</span>

          {showTooltip && (
            <div
              className="ep-stability-tooltip"
              style={{ top: tooltipPos.top, right: tooltipPos.right }}
            >
              <img src={mascotImg} alt="" className="ep-tooltip-mascot" />
              <div className="ep-tooltip-bubble">
                <span className="ep-tooltip-name">{characterName ?? 'AI 친구'}</span>
                <p className="ep-tooltip-desc">
                  감정 안정도는 이번 달 감정이 얼마나 균형있게 유지됐는지를 나타내요.
                </p>
                <p className="ep-tooltip-comment">{stabilityComment}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <button className="ep-stats-btn" onClick={() => navigate('/stats')}>
        📊 전체 통계 보기
      </button>
    </div>
  );
};

export default EmotionPanel;
