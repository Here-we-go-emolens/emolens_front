import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { ResponsiveSankey } from '@nivo/sankey';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import { getStats } from '@/services/statsApi';
import { getDiaryList } from '@/services/diaryApi';
import { EMOTION_MAP } from '@/constants/emotions';
import '@/styles/Stats/StatsPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const DIST_COLORS    = ['#f26a21', '#f9a06e', '#fbbf90', '#fcd3b0', '#fde8d0', '#74B9FF', '#A29BFE', '#6BCB77'];
const TRIGGER_COLORS = ['#f26a21', '#f9a06e', '#6bba7c', '#74B9FF', '#A29BFE'];
const REC_ICONS      = ['📋', '🚶', '📝'];
const WEATHER_ICON   = { SUNNY: '☀️', CLOUDY: '⛅', RAINY: '🌧️', SNOWY: '❄️' };
const WEATHER_LABEL  = { SUNNY: '맑음', CLOUDY: '흐림', RAINY: '비', SNOWY: '눈' };

function kwSize(count, max) {
  const ratio = max > 0 ? count / max : 0;
  if (ratio >= 0.7) return 'lg';
  if (ratio >= 0.4) return 'md';
  if (ratio >= 0.2) return 'sm';
  return 'xs';
}

// ── 소형 컴포넌트 ─────────────────────────────────────────
function StatCard({ icon, value, unit, label, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div className="stat-body">
        <div className="stat-value">{value}<span className="stat-unit">{unit}</span></div>
        <div className="stat-label">{label}</div>
        <div className="stat-sub">{sub}</div>
      </div>
    </div>
  );
}

function PanelCard({ icon, title, children }) {
  return (
    <div className="panel-card">
      <div className="panel-card-head">
        <span>{icon}</span>
        <span className="panel-card-title">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// 메인 페이지
// ══════════════════════════════════════════════════════════
export default function StatsPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const isPremium = user?.plan === 'PREMIUM';
  const [graphPeriod, setGraphPeriod]         = useState('7일');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [diaries, setDiaries]       = useState([]);
  const [prevStats, setPrevStats]   = useState(null);
  const [longTermStats, setLongTermStats] = useState([]);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
    getDiaryList(0, 50)
      .then(data => setDiaries(data.content ?? []))
      .catch(() => {});

    const today = new Date();
    const pm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonthStr = `${pm.getFullYear()}-${String(pm.getMonth() + 1).padStart(2, '0')}`;
    getStats(prevMonthStr).then(setPrevStats).catch(() => {});

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    Promise.all(
      months.map(m =>
        getStats(m)
          .then(data => ({ month: `${parseInt(m.slice(5))}월`, stabilityScore: data?.summary?.stabilityScore ?? 0 }))
          .catch(() => ({ month: `${parseInt(m.slice(5))}월`, stabilityScore: 0 }))
      )
    ).then(setLongTermStats).catch(() => {});
  }, []);

  const handlePeriodClick = (period) => {
    if (period !== '7일' && !isPremium) setShowPremiumModal(true);
    else setGraphPeriod(period);
  };

  // ── 데이터 가공 ───────────────────────────────────────────
  const summary    = stats?.summary;
  const trend      = stats?.emotionTrend ?? [];
  const dist       = stats?.emotionDistribution ?? [];
  const keywords   = stats?.keywords ?? [];
  const dow        = stats?.dowPattern ?? [];
  const timeSlots  = stats?.timeSlotPattern ?? [];
  const triggers   = stats?.emotionTriggers ?? [];
  const aiInsights = stats?.aiInsights;

  const maxKwCount = keywords.length > 0 ? Math.max(...keywords.map(k => k.count)) : 1;

  const minDow  = dow.length       ? dow.reduce((a, b) => a.score < b.score ? a : b) : null;
  const minSlot = timeSlots.length ? timeSlots.reduce((a, b) => a.score < b.score ? a : b) : null;

  // 무료 플랜: 최근 7일만 차트에 표시
  const recentTrend = trend.slice(-7);

  // ── 날씨-감정 상관관계 ──────────────────────────────────
  const weatherEmotionMap = useMemo(() => {
    const groups = {};
    diaries.forEach(d => {
      if (!d.weather) return;
      if (!groups[d.weather]) groups[d.weather] = {};
      (d.userEmotions ?? []).forEach(e => {
        groups[d.weather][e.emotion] = (groups[d.weather][e.emotion] ?? 0) + 1;
      });
    });
    return Object.entries(groups).map(([weather, emotions]) => {
      const sorted = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
      return {
        weather,
        topEmotions: sorted.slice(0, 3).map(([id, cnt]) => ({ id, cnt, ...( EMOTION_MAP[id] ?? { label: id }) })),
      };
    });
  }, [diaries]);

  // ── 감정 전환 흐름 (Sankey) ─────────────────────────────
  const sankeyData = useMemo(() => {
    const sorted = [...diaries].sort((a, b) => (a.diaryDate ?? '').localeCompare(b.diaryDate ?? ''));
    const counts = {};
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i].userEmotions?.[0]?.emotion;
      const to   = sorted[i + 1].userEmotions?.[0]?.emotion;
      if (!from || !to || from === to) continue;
      const key = `${from}||${to}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const topLinks = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const nodeIds = new Set();
    topLinks.forEach(([key]) => {
      const [from, to] = key.split('||');
      nodeIds.add(`${from}_from`);
      nodeIds.add(`${to}_to`);
    });

    const nodes = [...nodeIds].map(nid => {
      const [id] = nid.split('_');
      const em = EMOTION_MAP[id];
      return { id: nid, label: em?.label ?? id, color: em?.border ?? '#ccc' };
    });

    const links = topLinks.map(([key, value]) => {
      const [from, to] = key.split('||');
      return { source: `${from}_from`, target: `${to}_to`, value };
    });

    return { nodes, links };
  }, [diaries]);

  // ── 이번 달 vs 지난 달 ──────────────────────────────────
  const currentMonthAvg = trend.length
    ? (trend.reduce((s, t) => s + t.score, 0) / trend.length).toFixed(1) : '-';
  const prevMonthAvg = prevStats?.emotionTrend?.length
    ? (prevStats.emotionTrend.reduce((s, t) => s + t.score, 0) / prevStats.emotionTrend.length).toFixed(1) : '-';

  // ── 장기 안정도 차트 ────────────────────────────────────
  const longTermLineData = {
    labels: longTermStats.map(m => m.month),
    datasets: [{
      label: '감정 안정도',
      data: longTermStats.map(m => m.stabilityScore),
      fill: true,
      backgroundColor: 'rgba(242, 106, 33, 0.07)',
      borderColor: '#f26a21',
      borderWidth: 2,
      pointBackgroundColor: '#f26a21',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      tension: 0.4,
    }],
  };
  const longTermLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff', borderColor: '#e0e0e0', borderWidth: 1,
        titleColor: '#111', bodyColor: '#f26a21', padding: 12, cornerRadius: 10,
        callbacks: { label: ctx => ` 안정도 ${ctx.parsed.y}%` },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#555', font: { size: 11 } } },
      y: { min: 0, max: 100, grid: { color: '#f0f0f0' }, border: { display: false },
           ticks: { color: '#9a9080', font: { size: 11 }, stepSize: 25, callback: v => `${v}%` } },
    },
  };

  // ── 주간 미니 바 차트 ────────────────────────────────────
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  const last7Days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - 6 + i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry   = trend.find(t => t.date === dateStr);
      return { day: DAY_NAMES[d.getDay()], date: dateStr, score: entry?.score ?? null, isToday: i === 6 };
    });
  }, [trend]); // eslint-disable-line react-hooks/exhaustive-deps

  const prev7Days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - 13 + i);
      const dateStr = d.toISOString().slice(0, 10);
      return trend.find(t => t.date === dateStr)?.score ?? null;
    });
  }, [trend]);

  // ── 전주 대비 변화 ────────────────────────────────────────
  const thisWeekScores = last7Days.map(d => d.score).filter(s => s !== null);
  const prevWeekScores = prev7Days.filter(s => s !== null);
  const thisWeekAvg = thisWeekScores.length ? thisWeekScores.reduce((a, b) => a + b, 0) / thisWeekScores.length : null;
  const prevWeekAvg = prevWeekScores.length ? prevWeekScores.reduce((a, b) => a + b, 0) / prevWeekScores.length : null;
  const scoreDelta  = thisWeekAvg !== null && prevWeekAvg !== null
    ? (thisWeekAvg - prevWeekAvg).toFixed(1)
    : null;

  // ── 이번 주 하이라이트 일기 ──────────────────────────────
  const highlightDiary = useMemo(() => {
    const today      = new Date();
    const weekAgo    = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);
    const todayStr   = today.toISOString().slice(0, 10);
    const thisWeek   = diaries.filter(d => d.diaryDate >= weekAgoStr && d.diaryDate <= todayStr);
    return thisWeek.find(d => d.status === 'COMPLETED') ?? thisWeek[0] ?? null;
  }, [diaries]);

  const lineData = {
    labels: recentTrend.map(t => t.date?.slice(5)),
    datasets: [{
      label: '감정 점수',
      data: recentTrend.map(t => t.score),
      fill: true,
      backgroundColor: 'rgba(242, 106, 33, 0.07)',
      borderColor: '#f26a21',
      borderWidth: 2,
      pointBackgroundColor: '#f26a21',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        titleColor: '#111',
        bodyColor: '#f26a21',
        padding: 12,
        cornerRadius: 10,
        callbacks: { label: ctx => ` 감정 점수 ${ctx.parsed.y}점` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#555', font: { size: 11 } },
      },
      y: {
        min: 1, max: 10,
        grid: { color: '#f0f0f0', lineWidth: 1 },
        border: { display: false },
        ticks: { color: '#9a9080', font: { size: 11 }, stepSize: 3, callback: v => `${v}점` },
      },
    },
  };

  const donutData = {
    labels: dist.map(d => d.emotion),
    datasets: [{
      data: dist.map(d => d.percentage),
      backgroundColor: DIST_COLORS.slice(0, dist.length),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#111', font: { size: 12 }, padding: 14, usePointStyle: true, pointStyleWidth: 8 },
      },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        titleColor: '#111',
        bodyColor: '#f26a21',
        padding: 12,
        cornerRadius: 10,
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` },
      },
    },
  };

  if (loading) return (
    <div className="stats-layout">
      <SidebarLeft />
      <main className="stats-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>통계를 불러오는 중...</p>
      </main>
    </div>
  );

  return (
    <div className="stats-layout">
      <SidebarLeft />

      <main className="stats-main">

        {/* ① 요약 카드 */}
        <section className="section">
          <div className="summary-grid">
            <StatCard icon="📅" value={summary?.diaryCount ?? 0} unit="일" label="이번 달 기록" sub="이번 달 기준" />
            <StatCard icon="💜" value={summary?.mainEmotion ?? '-'} unit="" label="주요 감정" sub="가장 빈번" />
            <StatCard icon="🌿" value={summary?.stabilityScore ?? 0} unit="%" label="감정 안정도" sub="이번 달 평균" />
            <StatCard icon="🔥" value={summary?.streak ?? 0} unit="일" label="연속 기록" sub="오늘 포함" />
            <div className="stat-card ai-card">
              <span className="stat-icon">🤖</span>
              <div className="stat-body">
                <div className="ai-oneline">
                  {aiInsights?.summary
                    ? `"${aiInsights.summary.slice(0, 40)}..."`
                    : '"AI 분석이 완료되면 요약을 보여드릴게요."'}
                </div>
                <div className="stat-label">이번 달 AI 요약</div>
              </div>
            </div>
          </div>
        </section>

        {/* ①-b 주간 미니 차트 + 전주 대비 변화 + 하이라이트 */}
        <section className="section three-col-week">

          {/* 월~일 감정 점수 미니 바 차트 */}
          <div className="card week-mini-card">
            <div className="card-head">
              <div>
                <h3 className="card-title">이번 주 감정</h3>
                <p className="card-desc">일별 감정 점수 (1~10)</p>
              </div>
            </div>
            <div className="week-bar-chart">
              {last7Days.map(({ day, score, isToday }) => (
                <div key={day + isToday} className={`week-bar-col${isToday ? ' today' : ''}`}>
                  <span className="week-bar-score">{score !== null ? score.toFixed(1) : ''}</span>
                  <div className="week-bar-track">
                    <div
                      className="week-bar-fill"
                      style={{
                        height: score !== null ? `${(score / 10) * 100}%` : '0%',
                        background: score === null ? 'transparent'
                          : score >= 7 ? '#6bba7c'
                          : score >= 5 ? '#f9a06e'
                          : '#e57373',
                      }}
                    />
                  </div>
                  <span className="week-bar-day">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 전주 대비 변화 */}
          <div className="card week-delta-card">
            <div className="card-head">
              <div>
                <h3 className="card-title">전주 대비 변화</h3>
                <p className="card-desc">지난주 평균과 비교</p>
              </div>
            </div>
            {scoreDelta !== null ? (
              <div className="delta-body">
                <div className={`delta-badge ${Number(scoreDelta) >= 0 ? 'pos' : 'neg'}`}>
                  {Number(scoreDelta) >= 0 ? '▲' : '▼'} {Math.abs(scoreDelta)}점
                </div>
                <p className="delta-desc">
                  {Number(scoreDelta) >= 0
                    ? `지난주보다 감정 점수가 ${Math.abs(scoreDelta)}점 올랐어요`
                    : `지난주보다 감정 점수가 ${Math.abs(scoreDelta)}점 내려갔어요`}
                </p>
                <div className="delta-row">
                  <span className="delta-label">이번 주 평균</span>
                  <span className="delta-val">{Number(thisWeekAvg).toFixed(1)}점</span>
                </div>
                <div className="delta-row">
                  <span className="delta-label">지난 주 평균</span>
                  <span className="delta-val">{Number(prevWeekAvg).toFixed(1)}점</span>
                </div>
                {summary?.stabilityScore > 0 && (
                  <div className="delta-row">
                    <span className="delta-label">이번 달 안정도</span>
                    <span className="delta-val accent">{summary.stabilityScore}%</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="delta-empty">지난주 데이터가 쌓이면<br />비교 결과를 보여드릴게요</p>
            )}
          </div>

          {/* 이번 주 하이라이트 일기 */}
          <div className="card week-highlight-card">
            <div className="card-head">
              <div>
                <h3 className="card-title">이번 주 하이라이트</h3>
                <p className="card-desc">AI가 선정한 대표 일기</p>
              </div>
              {highlightDiary?.status === 'COMPLETED' && (
                <span className="period-badge">AI 분석완료</span>
              )}
            </div>
            {highlightDiary ? (
              <div className="highlight-body" onClick={() => navigate(`/diary/${highlightDiary.id}`)} style={{ cursor: 'pointer' }}>
                <div className="highlight-emotions">
                  {(highlightDiary.userEmotions ?? []).slice(0, 3).map(e => {
                    const em = EMOTION_MAP[e.emotion];
                    return em
                      ? <img key={e.emotion} src={em.image} alt={em.label} className="highlight-emotion-img" title={em.label} />
                      : null;
                  })}
                </div>
                <p className="highlight-title">{highlightDiary.title}</p>
                <span className="highlight-date">{highlightDiary.diaryDate?.replace(/-/g, '.')}</span>
                <p className="highlight-cta">일기 전체 보기 →</p>
              </div>
            ) : (
              <p className="delta-empty">이번 주 작성된<br />일기가 없어요</p>
            )}
          </div>

        </section>

        {/* ② 감정 변화 그래프 */}
        <section className="section">
          <div className="card">
            <div className="card-head">
              <div>
                <h3 className="card-title">감정 변화 추이</h3>
                <p className="card-desc">날짜별 감정 점수 · 1(매우 나쁨) ~ 10(매우 좋음)</p>
              </div>
              <div className="period-tabs">
                {['7일', '30일', '90일'].map(p => (
                  <button
                    key={p}
                    className={`period-tab ${graphPeriod === p ? 'active' : ''} ${p !== '7일' && !isPremium ? 'locked' : ''}`}
                    onClick={() => handlePeriodClick(p)}
                  >
                    {p !== '7일' && !isPremium && <span className="tab-lock">🔒</span>}
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-wrap" style={{ height: 220 }}>
              {recentTrend.length > 0
                ? <Line data={lineData} options={lineOptions} />
                : <p style={{ textAlign: 'center', color: '#999', paddingTop: 80 }}>이번 달 기록된 일기가 없어요.</p>
              }
            </div>
            {!isPremium && (
              <div className="chart-free-notice">
                <span>무료 플랜: 최근 7일만 표시</span>
                <button className="chart-upgrade-btn" onClick={() => navigate('/premium')}>
                  30일·90일 보기 →
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ②-b 주간/월간 리포트 배너 */}
        {!isPremium && (
          <section className="section">
            <div className="report-lock-grid">
              <div className="report-lock-card">
                <div className="rlc-left">
                  <span className="rlc-icon">📋</span>
                  <div>
                    <span className="rlc-title">주간 감정 리포트</span>
                    <p className="rlc-desc">이번 주 감정 패턴과 반복 고민 키워드를 정리해드려요</p>
                  </div>
                </div>
                <div className="rlc-preview">
                  <div className="rlc-blur-line w80" />
                  <div className="rlc-blur-line w60" />
                  <div className="rlc-blur-line w70" />
                </div>
                <button className="rlc-cta" onClick={() => navigate('/premium')}>🔒 리포트 보기</button>
              </div>
              <div className="report-lock-card">
                <div className="rlc-left">
                  <span className="rlc-icon">📅</span>
                  <div>
                    <span className="rlc-title">월간 감정 리포트</span>
                    <p className="rlc-desc">한 달간의 감정 여정과 성장 포인트를 돌아봐요</p>
                  </div>
                </div>
                <div className="rlc-preview">
                  <div className="rlc-blur-line w90" />
                  <div className="rlc-blur-line w55" />
                  <div className="rlc-blur-line w75" />
                </div>
                <button className="rlc-cta" onClick={() => navigate('/premium')}>🔒 리포트 보기</button>
              </div>
            </div>
          </section>
        )}

        {/* ③ 감정 분포 + 키워드 */}
        <section className="section two-col">
          <div className="card">
            <div className="card-head">
              <div>
                <h3 className="card-title">감정 분포</h3>
                <p className="card-desc">이번 달 감정별 비율</p>
              </div>
            </div>
            <div className="chart-wrap" style={{ height: 240 }}>
              {dist.length > 0
                ? <Doughnut data={donutData} options={donutOptions} />
                : <p style={{ textAlign: 'center', color: '#999', paddingTop: 80 }}>데이터가 없어요.</p>
              }
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <h3 className="card-title">자주 등장한 키워드</h3>
                <p className="card-desc">일기에서 반복된 단어들</p>
              </div>
            </div>
            <div className="kw-cloud">
              {keywords.length > 0
                ? keywords.map(k => (
                    <span key={k.text} className={`kw-tag kw-${kwSize(k.count, maxKwCount)}`}>{k.text}</span>
                  ))
                : <p style={{ color: '#999', fontSize: 14 }}>키워드 데이터가 없어요.</p>
              }
            </div>
          </div>
        </section>

        {/* ④ 패턴 분석 */}
        <section className="section">
          <h3 className="section-title">패턴 분석</h3>
          <div className="pattern-grid">

            {/* 요일별 */}
            <div className="card">
              <div className="pattern-card-title">📅 요일별 감정 패턴</div>
              <div className="dow-list">
                {dow.length > 0 ? dow.map(d => (
                  <div key={d.day} className="dow-row">
                    <span className="dow-day">{d.day}</span>
                    <div className="dow-track">
                      <div
                        className="dow-fill"
                        style={{
                          '--pct': `${(d.score / 10) * 100}%`,
                          background: d.score >= 7 ? '#6bba7c' : d.score >= 5 ? '#f9a06e' : '#e57373',
                        }}
                      />
                    </div>
                    <span className="dow-score">{d.score.toFixed(1)}</span>
                  </div>
                )) : <p style={{ color: '#999', fontSize: 14 }}>데이터가 없어요.</p>}
                {minDow && (
                  <p className="pattern-note">{minDow.day}요일에 감정 점수가 가장 낮아요</p>
                )}
              </div>
            </div>

            {/* 시간대별 */}
            <div className="card">
              <div className="pattern-card-title">🕐 시간대별 감정</div>
              <div className="time-list">
                {timeSlots.length > 0 ? timeSlots.map(t => (
                  <div key={t.slot} className="time-row">
                    <span className="time-icon">{t.icon}</span>
                    <div className="time-info">
                      <span className="time-label">{t.slot}</span>
                      <span className="time-desc">{t.desc}</span>
                    </div>
                    <div className="time-track">
                      <div
                        className="time-fill"
                        style={{
                          '--pct': `${(t.score / 10) * 100}%`,
                          background: t.score >= 7 ? '#6bba7c' : t.score >= 5 ? '#f9a06e' : '#e57373',
                        }}
                      />
                    </div>
                    <span className="time-score">{t.score.toFixed(1)}</span>
                  </div>
                )) : <p style={{ color: '#999', fontSize: 14 }}>데이터가 없어요.</p>}
                {minSlot && (
                  <p className="pattern-note">{minSlot.slot} 시간대에 감정이 가장 낮아요</p>
                )}
              </div>
            </div>

            {/* 트리거 분석 */}
            <div className="card">
              <div className="pattern-card-title">🔍 감정 트리거 분석</div>
              <div className="trigger-list">
                {triggers.length > 0 ? triggers.map((t, i) => (
                  <div key={`${t.keyword}-${i}`} className="trigger-row">
                    <span className="trigger-kw">{t.keyword}</span>
                    <span className="trigger-arrow">→</span>
                    <span
                      className="trigger-emo"
                      style={{ background: TRIGGER_COLORS[i % TRIGGER_COLORS.length] + '22', color: TRIGGER_COLORS[i % TRIGGER_COLORS.length] }}
                    >
                      {t.emotion}
                    </span>
                  </div>
                )) : <p style={{ color: '#999', fontSize: 14 }}>데이터가 없어요.</p>}
                {triggers.length > 0 && (
                  <p className="pattern-note">특정 상황이 반복적으로 감정에 영향을 주고 있어요</p>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ⑤ 이번 달 vs 지난 달 비교 */}
        <section className="section">
          <h3 className="section-title">이번 달 vs 지난 달</h3>
          <div className="month-compare-grid">
            {[
              {
                label: '이번 달',
                diaryCount:     summary?.diaryCount      ?? 0,
                avgScore:       currentMonthAvg,
                stabilityScore: summary?.stabilityScore   ?? 0,
                mainEmotion:    summary?.mainEmotion       ?? '-',
                highlight: true,
              },
              {
                label: '지난 달',
                diaryCount:     prevStats?.summary?.diaryCount      ?? 0,
                avgScore:       prevMonthAvg,
                stabilityScore: prevStats?.summary?.stabilityScore   ?? 0,
                mainEmotion:    prevStats?.summary?.mainEmotion       ?? '-',
                highlight: false,
              },
            ].map(m => (
              <div key={m.label} className={`month-card card${m.highlight ? ' month-card-current' : ''}`}>
                <div className="month-card-label">{m.label}</div>
                <div className="month-stat-row">
                  <span className="month-stat-icon">📅</span>
                  <span className="month-stat-key">작성 수</span>
                  <span className="month-stat-val">{m.diaryCount}일</span>
                </div>
                <div className="month-stat-row">
                  <span className="month-stat-icon">📈</span>
                  <span className="month-stat-key">평균 감정 점수</span>
                  <span className="month-stat-val">{m.avgScore}점</span>
                </div>
                <div className="month-stat-row">
                  <span className="month-stat-icon">🌿</span>
                  <span className="month-stat-key">감정 안정도</span>
                  <span className="month-stat-val">{m.stabilityScore}%</span>
                </div>
                <div className="month-stat-row">
                  <span className="month-stat-icon">💜</span>
                  <span className="month-stat-key">대표 감정</span>
                  <span className="month-stat-val">{m.mainEmotion}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ⑥ 날씨-감정 상관관계 + 감정 전환 흐름도 */}
        <section className="section two-col">

          {/* 날씨-감정 상관관계 */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3 className="card-title">날씨-감정 상관관계</h3>
                <p className="card-desc">날씨별 주요 감정 패턴</p>
              </div>
            </div>
            {weatherEmotionMap.length === 0 ? (
              <p style={{ color: '#999', fontSize: 14 }}>날씨가 기록된 일기가 없어요.</p>
            ) : (
              <div className="weather-emotion-list">
                {weatherEmotionMap.map(({ weather, topEmotions }) => (
                  <div key={weather} className="weather-row">
                    <div className="weather-icon-wrap">
                      <span className="weather-icon">{WEATHER_ICON[weather] ?? '🌤️'}</span>
                      <span className="weather-label">{WEATHER_LABEL[weather] ?? weather}</span>
                    </div>
                    <div className="weather-emotions">
                      {topEmotions.map(em => (
                        <div key={em.id} className="weather-emotion-chip" style={{ background: em.bg ?? '#f5f5f5', borderColor: em.border ?? '#ddd' }}>
                          {em.image && <img src={em.image} alt={em.label} className="wec-img" />}
                          <span className="wec-label">{em.label}</span>
                          <span className="wec-count">{em.cnt}회</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 감정 전환 흐름도 (Sankey) */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3 className="card-title">감정 전환 흐름도</h3>
                <p className="card-desc">일기 간 감정 변화 패턴</p>
              </div>
            </div>
            {sankeyData.links.length === 0 ? (
              <p style={{ color: '#999', fontSize: 14 }}>일기가 2편 이상 있어야 분석돼요.</p>
            ) : (
              <div style={{ height: 260 }}>
                <ResponsiveSankey
                  data={sankeyData}
                  margin={{ top: 8, right: 80, bottom: 8, left: 80 }}
                  align="justify"
                  colors={node => node.color}
                  nodeOpacity={1}
                  nodeThickness={14}
                  nodeInnerPadding={4}
                  nodeSpacing={18}
                  nodeBorderWidth={0}
                  nodeBorderRadius={4}
                  linkOpacity={0.35}
                  linkHoverOpacity={0.65}
                  linkContract={2}
                  enableLinkGradient
                  labelPosition="outside"
                  labelOrientation="horizontal"
                  labelPadding={10}
                  label={node => node.label}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
                  animate
                  motionConfig="gentle"
                  tooltip={({ node }) => (
                    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
                      {node.label}
                    </div>
                  )}
                />
              </div>
            )}
          </div>

        </section>

        {/* ⑦ 장기 안정도 추이 */}
        <section className="section">
          <div className={`card long-term-card${!isPremium ? ' locked-card' : ''}`}>
            <div className="card-head">
              <div>
                <h3 className="card-title">장기 감정 안정도 추이</h3>
                <p className="card-desc">최근 6개월 안정도 변화 (0~100%)</p>
              </div>
              {!isPremium && <span className="period-badge">🔒 Premium</span>}
            </div>
            {isPremium ? (
              <div className="chart-wrap" style={{ height: 200 }}>
                {longTermStats.some(m => m.stabilityScore > 0)
                  ? <Line data={longTermLineData} options={longTermLineOptions} />
                  : <p style={{ textAlign: 'center', color: '#999', paddingTop: 70 }}>6개월치 데이터가 쌓이면 표시돼요.</p>
                }
              </div>
            ) : (
              <div className="long-term-blur-wrap">
                <div className="long-term-blur-chart">
                  {[60, 45, 72, 58, 80, 65].map((h, i) => (
                    <div key={i} className="lt-dummy-bar" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="long-term-lock-overlay">
                  <span className="lt-lock-icon">📈</span>
                  <p className="lt-lock-text">3~6개월 감정 안정도 그래프는<br />Premium에서 확인할 수 있어요</p>
                  <button className="rlc-cta" onClick={() => navigate('/premium')}>Premium 알아보기</button>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Premium 모달 */}
      {showPremiumModal && (
        <div className="stats-modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="stats-modal-box" onClick={e => e.stopPropagation()}>
            <span className="stats-modal-emoji">📈</span>
            <h3 className="stats-modal-title">30일·90일 그래프는 Premium에서</h3>
            <p className="stats-modal-desc">
              한 달간의 감정 흐름을 보면,<br />
              당신의 패턴과 회복 지점이 보여요.
            </p>
            <button className="stats-modal-primary" onClick={() => navigate('/premium')}>
              Premium 알아보기
            </button>
            <button className="stats-modal-secondary" onClick={() => setShowPremiumModal(false)}>
              나중에 볼게요
            </button>
          </div>
        </div>
      )}

      {/* 오른쪽 AI 패널 */}
      <aside className="stats-panel">

        <PanelCard icon="🧠" title="AI 종합 분석">
          <p className="panel-body">
            {aiInsights?.summary ?? 'AI 분석이 완료되면 표시됩니다.'}
          </p>
        </PanelCard>

        <PanelCard icon="📈" title="감정 변화 해석">
          <p className="panel-body">
            {aiInsights?.trend ?? '충분한 일기가 쌓이면 변화 해석을 보여드릴게요.'}
          </p>
        </PanelCard>

        <PanelCard icon="🌱" title="추천 행동">
          {aiInsights?.recommendations?.length > 0 ? (
            <div className="rec-list">
              {aiInsights.recommendations.map((r, i) => (
                <div key={i} className="rec-item">
                  <span>{REC_ICONS[i] ?? '💡'}</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="panel-body">AI 분석이 완료되면 추천 행동을 보여드릴게요.</p>
          )}
        </PanelCard>

        <PanelCard icon="📊" title="이번 달 요약">
          <div className="mini-stats">
            <div className="mini-stat"><span className="mini-val">{summary?.diaryCount ?? 0}</span><span className="mini-label">총 기록일</span></div>
            <div className="mini-stat">
              <span className="mini-val">
                {trend.length > 0 ? (trend.reduce((s, t) => s + t.score, 0) / trend.length).toFixed(1) : '-'}
              </span>
              <span className="mini-label">평균 감정</span>
            </div>
            <div className="mini-stat"><span className="mini-val">{summary?.streak ?? 0}</span><span className="mini-label">연속 기록</span></div>
            <div className="mini-stat"><span className="mini-val">{summary?.stabilityScore ?? 0}%</span><span className="mini-label">감정 안정도</span></div>
          </div>
        </PanelCard>

      </aside>
    </div>
  );
}
