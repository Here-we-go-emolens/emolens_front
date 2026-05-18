import "@/styles/StampCalendar/StampCalendar.css";

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const StampCalendar = ({ diaries, year, month, onDayClick }) => {
  const monthInt = parseInt(month);
  const monthStr = String(monthInt).padStart(2, '0');
  const daysInMonth = new Date(year, monthInt, 0).getDate();
  const firstDayOfWeek = new Date(year, monthInt - 1, 1).getDay();
  const firstDayMon = (firstDayOfWeek + 6) % 7; // 월요일 시작

  const monthDiaries = diaries.filter(d => d.diaryDate?.startsWith(`${year}-${monthStr}`));
  const diaryListMap = monthDiaries.reduce((acc, d) => {
    const day = parseInt(d.diaryDate.split('-')[2]);
    if (!acc[day]) acc[day] = [];
    acc[day].push(d);
    return acc;
  }, {});
  const diaryDaySet = new Set(Object.keys(diaryListMap).map(Number));

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === monthInt;
  const todayDay = isCurrentMonth ? today.getDate() : null;

  const stampCount = diaryDaySet.size;
  const totalDays = isCurrentMonth ? today.getDate() : daysInMonth;
  const rate = Math.round((stampCount / totalDays) * 100);

  const cells = [
    ...Array(firstDayMon).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="stamp-calendar card">
      <div className="stamp-cal-head">
        <div>
          <div className="section-title">{monthInt}월 스탬프</div>
          <div className="stamp-cal-sub">{stampCount}개 달성 · {rate}% 달성률</div>
        </div>
        <div className="stamp-cal-badge">
          {stampCount >= 20 ? '🏆' : stampCount >= 10 ? '🌟' : stampCount >= 5 ? '✨' : '📅'}
          <span>{stampCount}</span>
        </div>
      </div>

      <div className="stamp-grid-header">
        {DAY_LABELS.map(l => <span key={l}>{l}</span>)}
      </div>

      <div className="stamp-grid">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="stamp-cell empty" />;
          const hasStamp = diaryDaySet.has(day);
          const isToday = day === todayDay;
          const isPast = todayDay !== null && day < todayDay;
          const isFuture = todayDay !== null && day > todayDay;

          const isClickable = hasStamp && onDayClick;
          return (
            <div
              key={day}
              className={`stamp-cell ${isToday ? 'is-today' : ''} ${isFuture ? 'is-future' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={isClickable ? () => onDayClick(diaryListMap[day]) : undefined}
            >
              <div className={`stamp-mark ${hasStamp ? 'stamped' : ''} ${isToday && hasStamp ? 'today-stamped' : ''}`}>
                {hasStamp
                  ? <span className="stamp-symbol">✦</span>
                  : isToday
                    ? <span className="stamp-today-dot" />
                    : isPast
                      ? <span className="stamp-missed">·</span>
                      : null
                }
              </div>
              <span className="stamp-day-num">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StampCalendar;
