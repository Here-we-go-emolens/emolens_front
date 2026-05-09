import { useState, useEffect } from 'react';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import { getWeeklyReports, completeAction } from '@/services/weeklyReportApi';
import '@/styles/WeeklyReport/WeeklyReportPage.css';

const ACTION_ICON = { MUSIC: '🎵', MOVIE: '🎬', ACTIVITY: '🏃', REST: '😴' };
const ACTION_LABEL = { MUSIC: '음악 추천', MOVIE: '영화 추천', ACTIVITY: '활동 추천', REST: '휴식 추천' };

const EMOTION_COLOR = {
  기쁨: '#f5c518', 행복: '#f5c518', 설렘: '#f5a623',
  슬픔: '#5b9bd5', 우울: '#5b9bd5',
  불안: '#e07b54', 두려움: '#e07b54',
  분노: '#e05454', 짜증: '#e05454',
  평온: '#6bbf7a', 안도: '#6bbf7a',
};

function weekLabel(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${fmt(s)}(${days[s.getDay()]}) ~ ${fmt(e)}(${days[e.getDay()]})`;
}

export default function WeeklyReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyReports()
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id) => {
    try {
      const updated = await completeAction(id);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="wr-layout">
      <SidebarLeft />

      <main className="wr-main">
        <h2 className="wr-title">주간 감정 리포트</h2>
        <p className="wr-desc">일기 3편 이상 쓴 주에 자동으로 생성돼요.</p>

        {loading ? (
          <p className="wr-loading">불러오는 중…</p>
        ) : reports.length === 0 ? (
          <div className="wr-empty">
            <div className="wr-empty-icon">📋</div>
            <p className="wr-empty-text">
              아직 생성된 리포트가 없어요.<br />
              일주일에 3편 이상 일기를 쓰면 매주 월요일에 리포트가 도착해요!
            </p>
          </div>
        ) : (
          <div className="wr-list">
            {reports.map((r) => (
              <div key={r.id} className="wr-card">
                <div className="wr-card-header">
                  <span className="wr-week-label">{weekLabel(r.startDate, r.endDate)}</span>
                  <span
                    className="wr-emotion-badge"
                    style={{ background: EMOTION_COLOR[r.dominantEmotion] ?? '#9e8dda' }}
                  >
                    {r.dominantEmotion}
                  </span>
                </div>

                <p className="wr-summary">{r.weeklySummary}</p>

                <div className="wr-recommendation">
                  <div className="wr-rec-header">
                    <span className="wr-rec-icon">{ACTION_ICON[r.recommendedAction] ?? '✨'}</span>
                    <span className="wr-rec-label">{ACTION_LABEL[r.recommendedAction] ?? r.recommendedAction}</span>
                  </div>
                  <p className="wr-rec-message">{r.recommendationMessage}</p>
                  {r.searchKeyword && (
                    <span className="wr-keyword">🔍 {r.searchKeyword}</span>
                  )}
                </div>

                <div className="wr-card-footer">
                  {r.isActionCompleted ? (
                    <span className="wr-completed">✅ 완료했어요!</span>
                  ) : (
                    <button className="wr-complete-btn" onClick={() => handleComplete(r.id)}>
                      완료했어요
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
