import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import '@/styles/Stats/StatsPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

// ══════════════════════════════════════════════════════════
// 더미 데이터 (추후 API로 교체)
// ══════════════════════════════════════════════════════════
const SUMMARY = [
  { icon: '📅', value: '24', unit: '일',  label: '이번 달 기록',  sub: '3월 기준' },
  { icon: '💜', value: '부담감', unit: '', label: '주요 감정',    sub: '가장 빈번' },
  { icon: '🌿', value: '68',   unit: '%', label: '감정 안정도',  sub: '이번 달 평균' },
  { icon: '🔥', value: '7',    unit: '일', label: '연속 기록',   sub: '오늘 포함' },
];

const AI_ONE_LINE = '"최근 피로와 부담이 함께 나타나는 경향이 있어요"';

const TREND_LABELS = ['3/1','3/3','3/5','3/7','3/9','3/11','3/13','3/15','3/17','3/19','3/21','3/23','3/25','3/27','3/29','3/31'];
const TREND_DATA   = [6, 5, 7, 4, 5, 6, 3, 4, 6, 7, 6, 5, 8, 7, 6, 5];

const DIST_LABELS = ['부담감', '피곤함', '안정감', '우울', '설렘'];
const DIST_DATA   = [35, 28, 18, 11, 8];
const DIST_COLORS = ['#f26a21', '#f9a06e', '#fbbf90', '#fcd3b0', '#fde8d0'];

const KEYWORDS = [
  { text: '과제',  size: 'lg' }, { text: '피곤',  size: 'lg' },
  { text: '걱정',  size: 'md' }, { text: '친구',  size: 'md' },
  { text: '발표',  size: 'md' }, { text: '수업',  size: 'sm' },
  { text: '산책',  size: 'sm' }, { text: '커피',  size: 'sm' },
  { text: '휴식',  size: 'sm' }, { text: '날씨',  size: 'xs' },
  { text: '책',    size: 'xs' }, { text: '음악',  size: 'xs' },
];

const DOW = [
  { day: '월', score: 6 }, { day: '화', score: 3 },
  { day: '수', score: 5 }, { day: '목', score: 4 },
  { day: '금', score: 7 }, { day: '토', score: 8 },
  { day: '일', score: 5 },
];

const TIME_SLOTS = [
  { slot: '아침',  icon: '🌅', score: 7, desc: '비교적 안정' },
  { slot: '오후',  icon: '☀️', score: 5, desc: '집중 부담' },
  { slot: '저녁',  icon: '🌆', score: 5, desc: '피로 누적' },
  { slot: '밤',    icon: '🌙', score: 4, desc: '불안감 증가' },
];

const TRIGGERS = [
  { keyword: '과제 · 발표', arrow: '→', emotion: '부담감', color: '#f26a21' },
  { keyword: '야간 작업',   arrow: '→', emotion: '피로감', color: '#f9a06e' },
  { keyword: '산책 · 음악', arrow: '→', emotion: '안정감', color: '#6bba7c' },
];

const AI_INSIGHTS = {
  summary: '이번 달에는 해야 할 일과 관련된 부담감이 반복적으로 나타났어요. 특히 화요일과 목요일에 감정 점수가 낮아지는 경향이 보입니다.',
  trend: '중순 이후 감정 기복이 줄어드는 경향이 있어요. 스스로 조절하는 능력이 조금씩 성장하고 있는 것 같아요.',
  recommendations: [
    { icon: '📋', text: '하루 할 일 목록을 3개 이하로 제한해보세요' },
    { icon: '🚶', text: '짧은 산책 루틴을 만들어보세요' },
    { icon: '📝', text: '자기 전 5분, 오늘의 감정을 정리해보세요' },
  ],
};

// ══════════════════════════════════════════════════════════
// Chart.js 옵션
// ══════════════════════════════════════════════════════════
const lineData = {
  labels: TREND_LABELS,
  datasets: [{
    label: '감정 점수',
    data: TREND_DATA,
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
      ticks: { color: '#9a9080', font: { size: 11 }, stepSize: 3,
               callback: v => `${v}점` },
    },
  },
};

const donutData = {
  labels: DIST_LABELS,
  datasets: [{
    data: DIST_DATA,
    backgroundColor: DIST_COLORS,
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
      labels: {
        color: '#111', font: { size: 12 },
        padding: 14, usePointStyle: true, pointStyleWidth: 8,
      },
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

// ══════════════════════════════════════════════════════════
// 소형 컴포넌트
// ══════════════════════════════════════════════════════════
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
  const [graphPeriod, setGraphPeriod] = useState('7일');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handlePeriodClick = (period) => {
    if (period !== '7일') {
      setShowPremiumModal(true);
    } else {
      setGraphPeriod(period);
    }
  };

  return (
    <div className="stats-layout">
      <SidebarLeft />

      <main className="stats-main">

        {/* ① 요약 카드 */}
        <section className="section">
          <div className="summary-grid">
            {SUMMARY.map(s => <StatCard key={s.label} {...s} />)}
            <div className="stat-card ai-card">
              <span className="stat-icon">🤖</span>
              <div className="stat-body">
                <div className="ai-oneline">{AI_ONE_LINE}</div>
                <div className="stat-label">이번 주 AI 요약</div>
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
                    className={`period-tab ${graphPeriod === p ? 'active' : ''} ${p !== '7일' ? 'locked' : ''}`}
                    onClick={() => handlePeriodClick(p)}
                  >
                    {p !== '7일' && <span className="tab-lock">🔒</span>}
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-wrap" style={{ height: 220 }}>
              <Line data={lineData} options={lineOptions} />
            </div>
            <div className="chart-free-notice">
              <span>무료 플랜: 최근 7일만 표시</span>
              <button className="chart-upgrade-btn" onClick={() => navigate('/premium')}>
                30일·90일 보기 →
              </button>
            </div>
          </div>
        </section>

        {/* ②-b 주간/월간 리포트 잠금 배너 */}
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
              <button className="rlc-cta" onClick={() => navigate('/premium')}>
                🔒 리포트 보기
              </button>
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
              <button className="rlc-cta" onClick={() => navigate('/premium')}>
                🔒 리포트 보기
              </button>
            </div>
          </div>
        </section>

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
              <Doughnut data={donutData} options={donutOptions} />
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
              {KEYWORDS.map(k => (
                <span key={k.text} className={`kw-tag kw-${k.size}`}>{k.text}</span>
              ))}
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
                {DOW.map(d => (
                  <div key={d.day} className="dow-row">
                    <span className="dow-day">{d.day}</span>
                    <div className="dow-track">
                      <div
                        className="dow-fill"
                        style={{ '--pct': `${(d.score / 10) * 100}%`,
                                 background: d.score >= 7 ? '#6bba7c' : d.score >= 5 ? '#f9a06e' : '#e57373' }}
                      />
                    </div>
                    <span className="dow-score">{d.score}</span>
                  </div>
                ))}
                <p className="pattern-note">화요일에 스트레스가 가장 높게 나타나요</p>
              </div>
            </div>

            {/* 시간대별 */}
            <div className="card">
              <div className="pattern-card-title">🕐 시간대별 감정</div>
              <div className="time-list">
                {TIME_SLOTS.map(t => (
                  <div key={t.slot} className="time-row">
                    <span className="time-icon">{t.icon}</span>
                    <div className="time-info">
                      <span className="time-label">{t.slot}</span>
                      <span className="time-desc">{t.desc}</span>
                    </div>
                    <div className="time-track">
                      <div
                        className="time-fill"
                        style={{ '--pct': `${(t.score / 10) * 100}%`,
                                 background: t.score >= 7 ? '#6bba7c' : t.score >= 5 ? '#f9a06e' : '#e57373' }}
                      />
                    </div>
                    <span className="time-score">{t.score}</span>
                  </div>
                ))}
                <p className="pattern-note">밤 시간대에 불안감이 높아지는 경향이 있어요</p>
              </div>
            </div>

            {/* 트리거 분석 */}
            <div className="card">
              <div className="pattern-card-title">🔍 감정 트리거 분석</div>
              <div className="trigger-list">
                {TRIGGERS.map(t => (
                  <div key={t.keyword} className="trigger-row">
                    <span className="trigger-kw">{t.keyword}</span>
                    <span className="trigger-arrow">{t.arrow}</span>
                    <span className="trigger-emo" style={{ background: t.color + '22', color: t.color }}>
                      {t.emotion}
                    </span>
                  </div>
                ))}
              </div>
              <p className="pattern-note">특정 상황이 반복적으로 감정에 영향을 주고 있어요</p>
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
          <p className="panel-body">{AI_INSIGHTS.summary}</p>
        </PanelCard>

        <PanelCard icon="📈" title="감정 변화 해석">
          <p className="panel-body">{AI_INSIGHTS.trend}</p>
        </PanelCard>

        <PanelCard icon="🌱" title="추천 행동">
          <div className="rec-list">
            {AI_INSIGHTS.recommendations.map((r, i) => (
              <div key={i} className="rec-item">
                <span>{r.icon}</span>
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </PanelCard>

        {/* 이번 달 미니 통계 */}
        <PanelCard icon="📊" title="이번 달 요약">
          <div className="mini-stats">
            <div className="mini-stat"><span className="mini-val">24</span><span className="mini-label">총 기록일</span></div>
            <div className="mini-stat"><span className="mini-val">5.6</span><span className="mini-label">평균 감정</span></div>
            <div className="mini-stat"><span className="mini-val">7</span><span className="mini-label">연속 기록</span></div>
            <div className="mini-stat"><span className="mini-val">↑12%</span><span className="mini-label">지난달 대비</span></div>
          </div>
        </PanelCard>

      </aside>
    </div>
  );
}
