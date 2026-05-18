import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/contexts/ToastContext';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ResponsiveSankey } from '@nivo/sankey';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import { getWeeklyReports, completeAction, devGenerateWeeklyReport } from '@/services/weeklyReportApi';
import { getDiaryList } from '@/services/diaryApi';
import { getStats } from '@/services/statsApi';
import { EMOTION_MAP } from '@/constants/emotions';
import '@/styles/WeeklyReport/WeeklyReportPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const ACTION_META = {
  MUSIC:    { icon: '🎵', label: '음악 추천',  colorClass: 'rec-music' },
  MOVIE:    { icon: '🎬', label: '영화 추천',  colorClass: 'rec-movie' },
  ACTIVITY: { icon: '🏃', label: '활동 추천',  colorClass: 'rec-activity' },
  REST:     { icon: '😴', label: '휴식 추천',  colorClass: 'rec-rest' },
};

const EMOTION_COLOR = {
  기쁨: '#f5c518', 행복: '#f5c518', 설렘: '#f5a623',
  슬픔: '#5b9bd5', 우울: '#5b9bd5',
  불안: '#e07b54', 두려움: '#e07b54',
  분노: '#e05454', 짜증: '#e05454',
  평온: '#6bbf7a', 안도: '#6bbf7a',
};

const WEATHER_ICON  = { SUNNY: '☀️', CLOUDY: '⛅', RAINY: '🌧️', SNOWY: '❄️' };
const WEATHER_LABEL = { SUNNY: '맑음', CLOUDY: '흐림', RAINY: '비', SNOWY: '눈' };

function weekLabel(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const fmt  = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${fmt(s)}(${days[s.getDay()]}) ~ ${fmt(e)}(${days[e.getDay()]})`;
}

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
    y: {
      min: 0, max: 100, grid: { color: '#f0f0f0' }, border: { display: false },
      ticks: { color: '#9a9080', font: { size: 11 }, stepSize: 25, callback: v => `${v}%` },
    },
  },
};

export default function WeeklyReportPage() {
  const { showToast } = useToast();
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [index, setIndex]               = useState(0);
  const [diaries, setDiaries]           = useState([]);
  const [currentStats, setCurrentStats] = useState(null);
  const [prevStats, setPrevStats]       = useState(null);
  const [longTermStats, setLongTermStats] = useState([]);
  const [generating, setGenerating]     = useState(false);

  const handleDevGenerate = async () => {
    setGenerating(true);
    try {
      const msg = await devGenerateWeeklyReport();
      const data = await getWeeklyReports();
      setReports(data);
      setIndex(Math.max(0, data.length - 1));
      showToast(msg, 'success');
    } catch (e) {
      showToast('생성 실패: ' + e.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    getWeeklyReports()
      .then((data) => {
        setReports(data);
        setIndex(Math.max(0, data.length - 1));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    getDiaryList(0, 200)
      .then(data => setDiaries(data.content ?? []))
      .catch(() => {});

    const today = new Date();
    const pm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonthStr = `${pm.getFullYear()}-${String(pm.getMonth() + 1).padStart(2, '0')}`;

    getStats().then(setCurrentStats).catch(() => {});
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

  const handleComplete = async (id) => {
    try {
      const updated = await completeAction(id);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      console.error(e);
    }
  };

  const r = reports[index];
  const actionMeta = r
    ? (ACTION_META[r.recommendedAction] ?? { icon: '✨', label: r.recommendedAction, colorClass: 'rec-default' })
    : null;

  // 선택된 주의 일기 필터링
  const weekDiaries = useMemo(() => {
    if (!r) return [];
    return [...diaries]
      .filter(d => d.diaryDate >= r.startDate && d.diaryDate <= r.endDate)
      .sort((a, b) => (a.diaryDate ?? '').localeCompare(b.diaryDate ?? ''));
  }, [diaries, r]);

  // 날씨-감정 상관관계
  const weatherEmotionMap = useMemo(() => {
    const groups = {};
    weekDiaries.forEach(d => {
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
        topEmotions: sorted.slice(0, 3).map(([id, cnt]) => ({ id, cnt, ...(EMOTION_MAP[id] ?? { label: id }) })),
      };
    });
  }, [weekDiaries]);

  // 감정 전환 흐름도 (Sankey)
  const sankeyData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < weekDiaries.length - 1; i++) {
      const from = weekDiaries[i].userEmotions?.[0]?.emotion;
      const to   = weekDiaries[i + 1].userEmotions?.[0]?.emotion;
      if (!from || !to || from === to) continue;
      const key = `${from}||${to}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const topLinks = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
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
  }, [weekDiaries]);

  // 이번 달 vs 지난 달
  const currentMonthAvg = currentStats?.emotionTrend?.length
    ? (currentStats.emotionTrend.reduce((s, t) => s + t.score, 0) / currentStats.emotionTrend.length).toFixed(1)
    : '-';
  const prevMonthAvg = prevStats?.emotionTrend?.length
    ? (prevStats.emotionTrend.reduce((s, t) => s + t.score, 0) / prevStats.emotionTrend.length).toFixed(1)
    : '-';

  // 장기 안정도 차트 데이터
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

  return (
    <div className="wr-layout">
      <SidebarLeft />

      <main className="wr-main">
        <h2 className="wr-title">주간 감정 리포트</h2>
        <p className="wr-desc">일기 3편 이상 쓴 주에 자동으로 생성돼요.</p>

        {import.meta.env.DEV && (
          <button
            onClick={handleDevGenerate}
            disabled={generating}
            style={{
              marginBottom: '16px',
              padding: '8px 16px',
              background: '#f26a21',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? '생성 중…' : '이번 주 리포트 즉시 생성 (DEV)'}
          </button>
        )}

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
          <>
            {/* 주차 내비게이션 */}
            <div className="wr-nav">
              <button
                className="wr-nav-btn"
                onClick={() => setIndex((i) => i - 1)}
                disabled={index === 0}
              >
                ← 이전 주
              </button>
              <span className="wr-nav-info">{index + 1} / {reports.length}주</span>
              <button
                className="wr-nav-btn"
                onClick={() => setIndex((i) => i + 1)}
                disabled={index === reports.length - 1}
              >
                다음 주 →
              </button>
            </div>

            {/* 기본 리포트 카드 */}
            <div className="wr-card">
              <div className="wr-card-header">
                <span className="wr-week-label">{weekLabel(r.startDate, r.endDate)}</span>
                <span
                  className="wr-emotion-badge"
                  style={{ background: EMOTION_COLOR[r.dominantEmotion] ?? '#f26a21' }}
                >
                  {r.dominantEmotion}
                </span>
              </div>

              <p className="wr-summary">{r.weeklySummary}</p>

              <div className={`wr-recommendation ${actionMeta.colorClass}`}>
                <div className="wr-rec-header">
                  <span className="wr-rec-icon">{actionMeta.icon}</span>
                  <span className="wr-rec-label">{actionMeta.label}</span>
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

            {/* ── 날씨-감정 상관관계 ── */}
            <div className="wr-section">
              <h3 className="wr-section-title">🌤️ 날씨-감정 상관관계</h3>
              <p className="wr-section-desc">이번 주 날씨별 감정 패턴</p>
              <div className="wr-card wr-section-card">
                {weatherEmotionMap.length === 0 ? (
                  <p className="wr-empty-section">날씨가 기록된 일기가 없어요.</p>
                ) : (
                  <div className="wr-weather-list">
                    {weatherEmotionMap.map(({ weather, topEmotions }) => (
                      <div key={weather} className="wr-weather-row">
                        <div className="wr-weather-icon-wrap">
                          <span className="wr-weather-icon">{WEATHER_ICON[weather] ?? '🌤️'}</span>
                          <span className="wr-weather-label">{WEATHER_LABEL[weather] ?? weather}</span>
                        </div>
                        <div className="wr-weather-emotions">
                          {topEmotions.map(em => (
                            <div
                              key={em.id}
                              className="wr-weather-chip"
                              style={{ background: em.bg ?? '#f5f5f5', borderColor: em.border ?? '#ddd' }}
                            >
                              {em.image && <img src={em.image} alt={em.label} className="wr-wec-img" />}
                              <span className="wr-wec-label">{em.label}</span>
                              <span className="wr-wec-count">{em.cnt}회</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── 감정 전환 흐름도 ── */}
            <div className="wr-section">
              <h3 className="wr-section-title">🔀 감정 전환 흐름도</h3>
              <p className="wr-section-desc">이번 주 일기 간 감정 변화 패턴</p>
              <div className="wr-card wr-section-card">
                {sankeyData.links.length === 0 ? (
                  <p className="wr-empty-section">일기가 2편 이상 있어야 분석돼요.</p>
                ) : (
                  <div style={{ height: 240 }}>
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
            </div>

            {/* ── 이번 달 vs 지난 달 ── */}
            <div className="wr-section">
              <h3 className="wr-section-title">📅 이번 달 vs 지난 달</h3>
              <p className="wr-section-desc">월별 감정 상태 비교</p>
              <div className="wr-month-grid">
                {[
                  {
                    label: '이번 달',
                    diaryCount:     currentStats?.summary?.diaryCount      ?? 0,
                    avgScore:       currentMonthAvg,
                    stabilityScore: currentStats?.summary?.stabilityScore   ?? 0,
                    mainEmotion:    currentStats?.summary?.mainEmotion       ?? '-',
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
                  <div key={m.label} className={`wr-month-card${m.highlight ? ' wr-month-card--current' : ''}`}>
                    <div className="wr-month-label">{m.label}</div>
                    <div className="wr-month-row">
                      <span className="wr-month-key">📝 작성 수</span>
                      <span className="wr-month-val">{m.diaryCount}일</span>
                    </div>
                    <div className="wr-month-row">
                      <span className="wr-month-key">📈 평균 감정</span>
                      <span className="wr-month-val">{m.avgScore}점</span>
                    </div>
                    <div className="wr-month-row">
                      <span className="wr-month-key">🌿 안정도</span>
                      <span className="wr-month-val">{m.stabilityScore}%</span>
                    </div>
                    <div className="wr-month-row">
                      <span className="wr-month-key">💜 대표 감정</span>
                      <span className="wr-month-val">{m.mainEmotion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 장기 안정도 추이 ── */}
            <div className="wr-section">
              <h3 className="wr-section-title">📈 장기 감정 안정도 추이</h3>
              <p className="wr-section-desc">최근 6개월 안정도 변화 (0~100%)</p>
              <div className="wr-card wr-section-card">
                {longTermStats.some(m => m.stabilityScore > 0) ? (
                  <div style={{ height: 200 }}>
                    <Line data={longTermLineData} options={longTermLineOptions} />
                  </div>
                ) : (
                  <p className="wr-empty-section">6개월치 데이터가 쌓이면 표시돼요.</p>
                )}
              </div>
            </div>

          </>
        )}
      </main>
    </div>
  );
}
