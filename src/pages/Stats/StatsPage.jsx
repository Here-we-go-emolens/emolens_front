import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import { getStats } from '@/services/statsApi';
import '@/styles/Stats/StatsPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const DIST_COLORS    = ['#f26a21', '#f9a06e', '#fbbf90', '#fcd3b0', '#fde8d0', '#74B9FF', '#A29BFE', '#6BCB77'];
const TRIGGER_COLORS = ['#f26a21', '#f9a06e', '#6bba7c', '#74B9FF', '#A29BFE'];
const REC_ICONS      = ['📋', '🚶', '📝'];

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
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
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
