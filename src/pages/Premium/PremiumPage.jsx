import { useNavigate } from 'react-router-dom';
import '@/styles/Premium/PremiumPage.css';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';

const FEATURES = [
  {
    icon: '📈',
    title: '감정 변화 그래프',
    desc: '7일·30일·90일 감정 흐름을 한눈에 확인하세요. 언제 가장 힘들었는지, 어떤 패턴이 있는지 선명하게 보여요.',
    badge: 'BEST',
  },
  {
    icon: '📋',
    title: '주간·월간 감정 리포트',
    desc: '매주 월요일, 지난 주의 감정을 AI가 정리해드려요. 반복되는 고민 키워드와 감정 변화를 리포트로 받아보세요.',
    badge: 'NEW',
  },
  {
    icon: '🤖',
    title: 'AI 심층 상담 무제한',
    desc: '일기 내용과 연동된 맥락 기반 상담을 무제한으로. 매달 10회 제한 없이 언제든 마음을 털어놓으세요.',
    badge: null,
  },
  {
    icon: '🔍',
    title: '심층 감정 분석',
    desc: '기본 3가지 감정에서 7가지 세부 감정까지, 감정의 근본 원인과 반복 패턴까지 분석해드려요.',
    badge: null,
  },
  {
    icon: '💡',
    title: '맞춤 행동 추천 고도화',
    desc: '오늘의 감정에 맞춘 추천을 1가지에서 3가지로. 더 구체적이고 나에게 딱 맞는 가이드를 받아보세요.',
    badge: null,
  },
  {
    icon: '📄',
    title: 'PDF 리포트 다운로드',
    desc: '나의 감정 기록을 PDF로 저장하고 언제든 돌아보세요. 상담사와 함께 보기에도 좋아요.',
    badge: null,
  },
];

const COMPARE = [
  { feature: '일기 작성', free: true,           premium: true },
  { feature: '기본 감정 분석 (3가지)', free: true, premium: true },
  { feature: '행동 추천', free: '1가지',         premium: '3가지' },
  { feature: '감정 키워드', free: '3개',         premium: '전체' },
  { feature: 'AI 채팅 상담', free: '월 10회',   premium: '무제한' },
  { feature: '심층 감정 분석', free: false,      premium: true },
  { feature: '감정 변화 그래프 (7일)', free: '미리보기', premium: true },
  { feature: '감정 변화 그래프 (30/90일)', free: false, premium: true },
  { feature: '주간 감정 리포트', free: false,    premium: true },
  { feature: '월간 감정 리포트', free: false,    premium: true },
  { feature: '반복 고민 키워드 분석', free: false, premium: true },
  { feature: '감정 히스토리', free: '최근 7일',  premium: '전체 기간' },
  { feature: 'PDF 다운로드', free: false,        premium: true },
];

const TESTIMONIALS = [
  {
    text: '주간 리포트를 받고서야 내가 화요일마다 유독 지쳐있다는 걸 알게 됐어요. 진짜 나를 발견하는 느낌이었어요.',
    name: '직장인 2년차',
    emoji: '😊',
  },
  {
    text: '채팅 상담이 무제한이 되니까 힘들 때 참지 않게 됐어요. 언제든 털어놓을 수 있다는 게 생각보다 큰 위안이 돼요.',
    name: '대학원생',
    emoji: '🌿',
  },
  {
    text: '감정 그래프를 보니 내가 주말에도 쉬지 못하고 있었더라고요. 그게 보이니까 의식적으로 쉬게 됐어요.',
    name: '프리랜서',
    emoji: '💙',
  },
];

function CellValue({ value }) {
  if (value === true)  return <span className="pm-check">✓</span>;
  if (value === false) return <span className="pm-cross">—</span>;
  return <span className="pm-val">{value}</span>;
}

export default function PremiumPage() {
  const navigate = useNavigate();

  return (
    <div className="pm-layout">
      <SidebarLeft />

      <main className="pm-main">

        {/* ── 히어로 ─────────────────────────────────── */}
        <section className="pm-hero">
          <div className="pm-hero-glow" />
          <span className="pm-badge">EmoLens Premium</span>
          <h1 className="pm-hero-title">
            감정을 기록하는 것에서<br />
            <span className="pm-hero-highlight">나를 진짜로 이해하는 것</span>으로
          </h1>
          <p className="pm-hero-desc">
            매일의 일기와 대화가 쌓이면, 당신만의 감정 지도가 완성돼요.<br />
            EmoLens Premium은 그 지도를 함께 읽어드려요.
          </p>
          <div className="pm-hero-btns">
            <button className="pm-btn-primary" onClick={() => navigate('/write')}>
              14일 무료 체험 시작하기
            </button>
            <p className="pm-hero-fine">약정 없이, 언제든 취소 가능해요 🤍</p>
          </div>
        </section>

        {/* ── 핵심 기능 카드 ─────────────────────────── */}
        <section className="pm-section">
          <h2 className="pm-section-title">Premium에서만 만날 수 있어요</h2>
          <div className="pm-features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="pm-feature-card">
                {f.badge && <span className={`pm-feature-badge ${f.badge === 'BEST' ? 'best' : 'new'}`}>{f.badge}</span>}
                <span className="pm-feature-icon">{f.icon}</span>
                <h3 className="pm-feature-title">{f.title}</h3>
                <p className="pm-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 가격 카드 ──────────────────────────────── */}
        <section className="pm-section">
          <h2 className="pm-section-title">플랜 선택</h2>
          <div className="pm-plans">

            <div className="pm-plan pm-plan-free">
              <div className="pm-plan-head">
                <span className="pm-plan-name">Free</span>
                <div className="pm-plan-price">
                  <span className="pm-plan-amount">0</span>
                  <span className="pm-plan-unit">원/월</span>
                </div>
                <p className="pm-plan-desc">핵심 경험을 무료로</p>
              </div>
              <ul className="pm-plan-list">
                <li>✓ 일기 작성 무제한</li>
                <li>✓ 기본 감정 분석</li>
                <li>✓ AI 채팅 월 10회</li>
                <li>✓ 최근 7일 히스토리</li>
              </ul>
              <button className="pm-plan-btn-ghost" onClick={() => navigate('/home')}>현재 이용 중</button>
            </div>

            <div className="pm-plan pm-plan-premium">
              <div className="pm-plan-rec">추천</div>
              <div className="pm-plan-head">
                <span className="pm-plan-name">Premium</span>
                <div className="pm-plan-price">
                  <span className="pm-plan-amount">9,900</span>
                  <span className="pm-plan-unit">원/월</span>
                </div>
                <p className="pm-plan-desc">연간 결제 시 7,900원/월</p>
              </div>
              <ul className="pm-plan-list">
                <li>✓ 모든 Free 기능 포함</li>
                <li>✓ 심층 감정 분석 (7가지)</li>
                <li>✓ AI 채팅 무제한</li>
                <li>✓ 주간·월간 감정 리포트</li>
                <li>✓ 감정 변화 그래프 (90일)</li>
                <li>✓ 반복 고민 키워드 분석</li>
                <li>✓ 전체 기간 히스토리</li>
                <li>✓ PDF 다운로드</li>
              </ul>
              <button className="pm-plan-btn-primary" onClick={() => navigate('/write')}>
                14일 무료 체험 시작하기
              </button>
              <p className="pm-plan-fine">언제든 취소 가능, 약정 없음</p>
            </div>

          </div>
        </section>

        {/* ── 기능 비교표 ────────────────────────────── */}
        <section className="pm-section">
          <h2 className="pm-section-title">기능 상세 비교</h2>
          <div className="pm-compare-wrap">
            <div className="pm-compare-head">
              <span className="pm-compare-feature-col">기능</span>
              <span className="pm-compare-plan-col">Free</span>
              <span className="pm-compare-plan-col pm-col-premium">Premium</span>
            </div>
            {COMPARE.map((row, i) => (
              <div key={i} className={`pm-compare-row ${i % 2 === 0 ? 'even' : ''}`}>
                <span className="pm-compare-feature">{row.feature}</span>
                <span className="pm-compare-cell"><CellValue value={row.free} /></span>
                <span className="pm-compare-cell pm-col-premium"><CellValue value={row.premium} /></span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 후기 ───────────────────────────────────── */}
        <section className="pm-section">
          <h2 className="pm-section-title">함께하고 있어요</h2>
          <div className="pm-testimonials">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="pm-testimonial">
                <span className="pm-test-emoji">{t.emoji}</span>
                <p className="pm-test-text">"{t.text}"</p>
                <span className="pm-test-name">— {t.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 마지막 CTA ─────────────────────────────── */}
        <section className="pm-final-cta">
          <div className="pm-final-cta-inner">
            <h2 className="pm-final-title">당신의 감정은 기록될 가치가 있어요.</h2>
            <p className="pm-final-desc">
              압박 없이, 조용히, 당신 곁에서.<br />
              준비됐을 때 시작하세요. 14일은 무료예요.
            </p>
            <button className="pm-btn-primary pm-btn-xl" onClick={() => navigate('/write')}>
              지금 시작하기 →
            </button>
            <p className="pm-final-fine">신용카드 없이 시작 가능 · 언제든 취소</p>
          </div>
        </section>

      </main>
    </div>
  );
}
