import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingPage.css';

/* ── 더미 데이터 ─────────────────────────────────────── */
const FEATURES = [
  {
    num: '01',
    accent: '#7c6fcd',
    accentBg: '#f0edf8',
    title: '감정 기록',
    desc: '하루를 자유롭게 기록하고\n감정을 남겨보세요',
  },
  {
    num: '02',
    accent: '#5bb5cc',
    accentBg: '#eaf6fb',
    title: 'AI 감정 분석',
    desc: '일기를 기반으로 감정 상태를\n분석해드립니다',
  },
  {
    num: '03',
    accent: '#6bbfa0',
    accentBg: '#eaf7f2',
    title: '패턴 분석',
    desc: '나도 몰랐던 감정 흐름을\n발견할 수 있어요',
  },
  {
    num: '04',
    accent: '#c98fcd',
    accentBg: '#f7edf8',
    title: '맞춤 추천',
    desc: '당신에게 맞는 행동과\n힌트를 제공합니다',
  },
];

const STEPS = [
  { label: '일기 작성', sub: '오늘 하루를 솔직하게 적어보세요' },
  { label: 'AI 분석', sub: 'AI가 감정 맥락을 읽어냅니다' },
  { label: '감정 확인', sub: '분석된 감정 패턴을 확인하세요' },
  { label: '개선 추천', sub: '나에게 맞는 가이드를 받아요' },
];

/* ── 컴포넌트 ─────────────────────────────────────────── */
export default function OnboardingPage() {
  const navigate = useNavigate();
  const fadeRefs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('ob-visible')),
      { threshold: 0.12 }
    );
    fadeRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  return (
    <div className="ob-root">

      {/* ── NAV ───────────────────────────────────────── */}
      <nav className="ob-nav">
        <div className="ob-nav-inner">
          <span className="ob-logo">EmoLens</span>
          <div className="ob-nav-actions">
            <button className="ob-nav-login" onClick={() => navigate('/')}>로그인</button>
            <button className="ob-nav-start" onClick={() => navigate('/write')}>시작하기</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="ob-hero">
        <div className="ob-hero-glow glow-a" />
        <div className="ob-hero-glow glow-b" />
        <div className="ob-hero-glow glow-c" />

        <div className="ob-hero-inner">
          <div className="ob-hero-text">
            <span className="ob-badge">감정 AI 일기 서비스</span>
            <h1 className="ob-hero-title">
              당신의 감정을<br />
              <span className="ob-hero-highlight">기록해보세요</span>
            </h1>
            <p className="ob-hero-sub">AI가 당신의 하루를 이해해드립니다</p>
            <p className="ob-hero-desc">
              매일의 기록을 통해 감정을 분석하고,<br />더 나은 하루를 만들어보세요
            </p>
            <div className="ob-hero-btns">
              <button className="ob-btn-primary" onClick={() => navigate('/write')}>
                지금 시작하기
              </button>
              <button className="ob-btn-ghost" onClick={() => navigate('/')}>
                로그인
              </button>
            </div>
          </div>

          <div className="ob-hero-card">
            <div className="ob-diary-card">
              <div className="ob-diary-header">
                <div className="ob-diary-dots">
                  <span /><span /><span />
                </div>
                <span className="ob-diary-date">2025년 4월 1일 · 맑음</span>
              </div>
              <div className="ob-diary-body">
                <div className="ob-diary-line w80" />
                <div className="ob-diary-line w60" />
                <div className="ob-diary-line w90" />
                <div className="ob-diary-line w50" />
              </div>
              <div className="ob-diary-emotions">
                <div className="ob-diary-emotion-row">
                  <span>행복</span>
                  <div className="ob-bar-track">
                    <div className="ob-bar-fill" style={{ width: '76%', background: '#7c6fcd' }} />
                  </div>
                  <span className="ob-bar-pct">76%</span>
                </div>
                <div className="ob-diary-emotion-row">
                  <span>평온</span>
                  <div className="ob-bar-track">
                    <div className="ob-bar-fill" style={{ width: '58%', background: '#5bb5cc' }} />
                  </div>
                  <span className="ob-bar-pct">58%</span>
                </div>
                <div className="ob-diary-emotion-row">
                  <span>활력</span>
                  <div className="ob-bar-track">
                    <div className="ob-bar-fill" style={{ width: '42%', background: '#6bbfa0' }} />
                  </div>
                  <span className="ob-bar-pct">42%</span>
                </div>
              </div>
              <div className="ob-diary-tag-row">
                <span className="ob-tag" style={{ background: '#f0edf8', color: '#7c6fcd' }}>긍정적</span>
                <span className="ob-tag" style={{ background: '#eaf7f2', color: '#6bbfa0' }}>안정적</span>
                <span className="ob-tag" style={{ background: '#eaf6fb', color: '#5bb5cc' }}>차분함</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ob-hero-scroll-hint">
          <div className="ob-scroll-mouse"><div className="ob-scroll-wheel" /></div>
          <span>스크롤하여 더 알아보기</span>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section className="ob-features">
        <div className="ob-section-inner">
          <div ref={addRef} className="ob-fade ob-section-head">
            <p className="ob-section-label">핵심 기능</p>
            <h2 className="ob-section-title">감정 기록의 새로운 경험</h2>
            <p className="ob-section-desc">EmoLens는 매일의 감정을 기록하고 AI로 분석해 당신을 더 잘 이해할 수 있도록 돕습니다</p>
          </div>
          <div className="ob-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                ref={addRef}
                className="ob-fade ob-feature-card"
                style={{ '--accent': f.accent, '--accent-bg': f.accentBg, transitionDelay: `${i * 80}ms` }}
              >
                <div className="ob-feature-num-wrap">
                  <span className="ob-feature-num" style={{ color: f.accent }}>{f.num}</span>
                </div>
                <div className="ob-feature-divider" style={{ background: f.accent }} />
                <h3 className="ob-feature-title">{f.title}</h3>
                <p className="ob-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section className="ob-steps">
        <div className="ob-section-inner">
          <div ref={addRef} className="ob-fade ob-section-head">
            <p className="ob-section-label">사용 방법</p>
            <h2 className="ob-section-title">이렇게 사용하세요</h2>
          </div>
          <div className="ob-steps-flow">
            {STEPS.map((s, i) => (
              <div key={s.label} className="ob-steps-row">
                <div ref={addRef} className="ob-fade ob-step-item" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="ob-step-circle">
                    <span className="ob-step-idx">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="ob-step-text">
                    <strong>{s.label}</strong>
                    <span>{s.sub}</span>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="ob-step-arrow">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10h12M12 6l4 4-4 4" stroke="#c5bfdf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ─────────────────────────────────────── */}
      <section className="ob-quote">
        <div ref={addRef} className="ob-fade ob-quote-inner">
          <div className="ob-quote-deco">"</div>
          <p className="ob-quote-main">감정은 기록될 때 더 선명해집니다</p>
          <p className="ob-quote-sub">당신의 하루를 이해하는 가장 쉬운 방법</p>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────── */}
      <section className="ob-cta">
        <div className="ob-cta-glow" />
        <div ref={addRef} className="ob-fade ob-cta-inner">
          <h2 className="ob-cta-title">지금 당신의 감정을<br />기록해보세요</h2>
          <p className="ob-cta-desc">오늘 하루의 감정을 기록하고 AI의 분석을 받아보세요</p>
          <button className="ob-btn-primary ob-btn-xl" onClick={() => navigate('/write')}>
            시작하기
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="ob-footer">
        <span className="ob-logo ob-logo-sm">EmoLens</span>
        <p>© 2025 EmoLens · 감정일기 서비스 · 모든 감정은 소중합니다</p>
      </footer>
    </div>
  );
}
