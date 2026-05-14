import { useEffect } from 'react';
import "@/styles/StampCalendar/StampCelebration.css";

const makeSparks = () => Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * 360;
  const dist = 60 + Math.random() * 40;
  return {
    tx: Math.round(Math.cos((angle * Math.PI) / 180) * dist),
    ty: Math.round(Math.sin((angle * Math.PI) / 180) * dist),
    delay: Math.random() * 0.3,
  };
});

const StampCelebration = ({ onDone }) => {
  const sparks = makeSparks();
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="sc-overlay" onClick={onDone}>
      <div className="sc-inner">
        <div className="sc-stamp-wrap">
          <div className="sc-ink-ring" />
          <div className="sc-stamp">
            <span className="sc-stamp-symbol">✦</span>
          </div>
          {sparks.map((s, i) => (
            <div
              key={i}
              className="sc-spark"
              style={{
                '--tx': `${s.tx}px`,
                '--ty': `${s.ty}px`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="sc-title">오늘의 스탬프 획득!</div>
        <div className="sc-sub">일기를 기록했어요 🎉</div>
      </div>
    </div>
  );
};

export default StampCelebration;
