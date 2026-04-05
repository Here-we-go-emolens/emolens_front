import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/Onboarding/OnboardingPage.css';

/* ─────────────────────────────────────────────────────────
   더미 데이터
───────────────────────────────────────────────────────── */

const NAV_LINKS = ['서비스 소개', '기능', '요금제', '고객 사례', '뉴스'];

const TAGS = [
  { label: '감정 분석 AI',   top: '18%',  left: '8%'  },
  { label: '일기 기반 학습', top: '12%',  right: '10%' },
  { label: '행동 추천',      top: '68%',  left: '5%'  },
  { label: '스트레스 지수',  top: '72%',  right: '8%' },
  { label: '감정 히스토리',  top: '38%',  left: '2%'  },
  { label: '주간 리포트',    top: '42%',  right: '3%' },
];

const BRAND_STATS = [
  { value: '98%',    label: '사용자 만족도' },
  { value: '24만+',  label: '누적 일기 분석' },
  { value: '4.9',    label: '앱 스토어 평점' },
  { value: '150+',   label: '지원 감정 유형' },
];

const SERVICES = [
  {
    tag: '일기 분석',
    title: '하루를 기록하면\nAI가 감정을 읽습니다',
    desc: '자유롭게 쓴 일기에서 감정 패턴과 스트레스 신호를 분석합니다',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  {
    tag: 'AI 채팅',
    title: '대화하듯 털어놓으면\n공감으로 답합니다',
    desc: 'AI 상담사와 자유롭게 대화하며 감정을 정리하고 위로받으세요',
    bg: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #1f3a5f 100%)',
  },
  {
    tag: '감정 리포트',
    title: '주간·월간 흐름으로\n나를 더 잘 이해하세요',
    desc: '감정 변화 그래프와 반복 패턴을 통해 자기 이해를 높여드립니다',
    bg: 'linear-gradient(135deg, #2d1b33 0%, #1a0a2e 50%, #0d0d1a 100%)',
  },
];

const NEWS = [
  {
    category: '서비스 업데이트',
    date: '2026.03.28',
    title: 'EmoLens Premium 출시 — 심층 감정 분석과 무제한 AI 상담',
    desc: '주간·월간 리포트, 90일 감정 그래프 등 핵심 프리미엄 기능을 공개합니다.',
  },
  {
    category: '연구',
    date: '2026.03.15',
    title: '감정 일기 4주 사용 시 스트레스 지수 23% 감소 — 내부 리서치 결과',
    desc: '자사 사용자 1,200명 대상 연구에서 일기 기반 감정 추적의 효과를 확인했습니다.',
  },
  {
    category: '파트너십',
    date: '2026.02.20',
    title: '국내 3개 대학 학생 정신건강 프로그램에 EmoLens 공식 도입',
    desc: '대학교 상담센터와의 협력을 통해 학생 감정 케어 솔루션으로 채택되었습니다.',
  },
  {
    category: '수상',
    date: '2026.01.10',
    title: '2026 K-스타트업 멘탈헬스 부문 최우수상 수상',
    desc: '혁신적인 AI 기반 감정 분석 기술력과 사용자 경험을 인정받았습니다.',
  },
];

const PARTNERS = [
  'Seoul Univ.', 'KAIST', 'Yonsei', 'Korea Univ.',
  'MindCare+', 'WellnessLab', 'ThinkBetter', 'EmotiQ',
  'CalmTech', 'PsyBridge', 'MoodMap', 'InnerSpace',
];

const COMPARE_ROWS = [
  { feature: '일기 작성',           free: '무제한',  premium: '무제한' },
  { feature: '기본 감정 분석',       free: '✓',      premium: '✓' },
  { feature: 'AI 채팅 상담',         free: '월 10회', premium: '무제한' },
  { feature: '감정 변화 그래프',      free: '미리보기', premium: '7일·30일·90일' },
  { feature: '주간·월간 감정 리포트', free: '—',      premium: '✓' },
  { feature: '심층 감정 분석',        free: '—',      premium: '✓' },
  { feature: '반복 고민 키워드 분석', free: '—',      premium: '✓' },
  { feature: '가격',                  free: '무료',   premium: '월 9,900원' },
];

/* ─────────────────────────────────────────────────────────
   컴포넌트
───────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const navigate  = useNavigate();
  const fadeRefs  = useRef([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* 스크롤 감지 → 네비 배경 전환 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* IntersectionObserver 페이드인 */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('lp-visible')),
      { threshold: 0.1 }
    );
    fadeRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  return (
    <div className="lp-root">

      {/* ══════════════════════════════════════════════════
          01. NAVIGATION
      ══════════════════════════════════════════════════ */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav--solid' : ''}`}>
        <div className="lp-nav-inner">
          {/* 로고 */}
          <button className="lp-logo" onClick={() => navigate('/')}>
            <span className="lp-logo-dot" />
            EmoLens
          </button>

          {/* 메뉴 (PC) */}
          <ul className="lp-nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l}><a href="#" className="lp-nav-link">{l}</a></li>
            ))}
          </ul>

          {/* 우측 버튼 */}
          <div className="lp-nav-actions">
            <button className="lp-nav-login" onClick={() => navigate('/login')}>로그인</button>
            <button className="lp-nav-start" onClick={() => navigate('/write')}>무료 시작 →</button>
          </div>

          {/* 햄버거 (모바일) */}
          <button className="lp-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span /><span /><span />
          </button>
        </div>

        {/* 모바일 메뉴 드로어 */}
        {mobileMenuOpen && (
          <div className="lp-mobile-menu">
            {NAV_LINKS.map((l) => (
              <a key={l} href="#" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>{l}</a>
            ))}
            <div className="lp-mobile-btns">
              <button onClick={() => navigate('/login')}>로그인</button>
              <button className="primary" onClick={() => navigate('/write')}>무료 시작</button>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════════════
          02. HERO — 풀스크린, 어두운 오버레이, 좌하단 헤드라인
      ══════════════════════════════════════════════════ */}
      <section className="lp-hero">
        {/* 배경 (더미 이미지 자리 — 실제 사진으로 교체 가능) */}
        <div className="lp-hero-bg" />
        <div className="lp-hero-overlay" />

        {/* 상단 보조 레이블 */}
        <div className="lp-hero-label">
          <span className="lp-hero-label-dot" />
          AI 기반 감정 케어 플랫폼
        </div>

        {/* 좌하단 헤드라인 */}
        <div className="lp-hero-content">
          <p className="lp-hero-eyebrow">감정을 이해하는 기술</p>
          <h1 className="lp-hero-title">
            당신의 하루가<br />
            데이터가 됩니다
          </h1>
          <p className="lp-hero-sub">
            일기 한 줄이 AI 분석으로 이어지고,<br />
            쌓인 데이터가 당신을 더 잘 이해하게 만듭니다.
          </p>
          <div className="lp-hero-btns">
            <button className="lp-hero-cta" onClick={() => navigate('/write')}>
              무료로 시작하기
            </button>
            <button className="lp-hero-ghost" onClick={() => navigate('/login')}>
              로그인
            </button>
          </div>
        </div>

        {/* 우하단 스크롤 힌트 */}
        <div className="lp-hero-scroll">
          <div className="lp-hero-scroll-line" />
          <span>SCROLL</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          03. BRAND INTRO — 흰 배경, 원형 네트워크 SVG, 라벨 태그
      ══════════════════════════════════════════════════ */}
      <section className="lp-brand">
        <div className="lp-brand-inner">

          {/* 좌측 텍스트 */}
          <div ref={addRef} className="lp-fade lp-brand-text">
            <p className="lp-section-label">ABOUT EMOLENS</p>
            <h2 className="lp-section-title">
              감정 데이터로<br />
              더 나은 하루를
            </h2>
            <p className="lp-section-desc">
              EmoLens는 매일의 감정 기록을 AI가 분석해 사용자 스스로
              감정 패턴을 이해하고 더 나은 선택을 할 수 있도록 돕는
              감정 인텔리전스 플랫폼입니다.
            </p>
            <div className="lp-brand-stats">
              {BRAND_STATS.map((s) => (
                <div key={s.label} className="lp-brand-stat">
                  <span className="lp-stat-value">{s.value}</span>
                  <span className="lp-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 우측 네트워크 그래픽 + 태그 */}
          <div ref={addRef} className="lp-fade lp-brand-graphic" style={{ transitionDelay: '120ms' }}>
            {/* 플로팅 라벨 태그 */}
            {TAGS.map((t, i) => (
              <span
                key={i}
                className="lp-float-tag"
                style={{ top: t.top, left: t.left, right: t.right }}
              >
                {t.label}
              </span>
            ))}
            {/* 원형 네트워크 SVG */}
            <svg className="lp-network-svg" viewBox="0 0 400 400" fill="none">
              {/* 동심원 */}
              <circle cx="200" cy="200" r="170" stroke="#e8e4f0" strokeWidth="1" />
              <circle cx="200" cy="200" r="130" stroke="#e8e4f0" strokeWidth="1" strokeDasharray="4 6" />
              <circle cx="200" cy="200" r="90"  stroke="#e8e4f0" strokeWidth="1" />
              <circle cx="200" cy="200" r="50"  stroke="#f26a21" strokeWidth="1.5" strokeDasharray="3 5" />
              {/* 중심 */}
              <circle cx="200" cy="200" r="18" fill="#f26a21" />
              <text x="200" y="205" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">AI</text>
              {/* 노드들 */}
              {[
                [200, 30], [340, 110], [355, 280], [200, 375], [45, 280], [60, 110],
                [200, 110], [310, 155], [310, 250], [200, 295], [90, 250], [90, 155],
              ].map(([x, y], i) => (
                <g key={i}>
                  <line x1="200" y1="200" x2={x} y2={y} stroke="#e0daf0" strokeWidth="0.8" />
                  <circle cx={x} cy={y} r={i < 6 ? 6 : 5}
                    fill={i < 6 ? '#f26a21' : '#7c6fcd'}
                    opacity={i < 6 ? 0.8 : 0.5}
                  />
                </g>
              ))}
            </svg>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          04. ORANGE CIRCLE FEATURE — 큰 원형 포인트
      ══════════════════════════════════════════════════ */}
      <section className="lp-circle-feature">
        <div ref={addRef} className="lp-fade lp-circle-wrap">
          {/* 장식 원들 */}
          <div className="lp-circle-deco lp-circle-deco--outer" />
          <div className="lp-circle-deco lp-circle-deco--mid" />
          {/* 메인 오렌지 원 */}
          <div className="lp-circle-main">
            <p className="lp-circle-eyebrow">CORE ENGINE</p>
            <h2 className="lp-circle-title">
              감정을 읽는<br />AI 엔진
            </h2>
            <p className="lp-circle-desc">
              자연어 처리와 감정 모델이<br />
              당신의 일기를 분석합니다
            </p>
          </div>
        </div>

        {/* 주변 피처 포인트 */}
        <div className="lp-circle-features">
          {[
            { icon: '🧠', title: '자연어 처리', desc: '일기 텍스트에서 감정 신호를 추출' },
            { icon: '📊', title: '패턴 학습', desc: '개인화된 감정 베이스라인 구축' },
            { icon: '💡', title: '맥락 이해', desc: '상황과 감정의 관계를 파악' },
            { icon: '🔁', title: '지속 학습', desc: '사용할수록 정확해지는 분석' },
          ].map((f, i) => (
            <div ref={addRef} key={i} className="lp-fade lp-circle-feat" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="lp-cf-icon">{f.icon}</span>
              <strong className="lp-cf-title">{f.title}</strong>
              <p className="lp-cf-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          05. ORANGE FULL BANNER — 강한 오렌지 배경 + 원형 패턴
      ══════════════════════════════════════════════════ */}
      <section className="lp-orange-banner">
        {/* 반투명 원형 패턴들 */}
        <div className="lp-ob-circle lp-ob-circle--1" />
        <div className="lp-ob-circle lp-ob-circle--2" />
        <div className="lp-ob-circle lp-ob-circle--3" />

        <div ref={addRef} className="lp-fade lp-ob-content">
          <p className="lp-ob-eyebrow">WHY EMOLENS</p>
          <h2 className="lp-ob-title">
            감정을 무시하면<br />
            몸이 먼저 신호를 보냅니다
          </h2>
          <p className="lp-ob-desc">
            번아웃의 78%는 감정 신호를 놓친 결과입니다.<br />
            EmoLens는 당신이 놓치기 전에 먼저 알아챕니다.
          </p>
          <button className="lp-ob-cta" onClick={() => navigate('/write')}>
            지금 무료로 시작하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          06. SERVICE CARDS — 3열 그리드, 배경 그라데이션 + 오버레이
      ══════════════════════════════════════════════════ */}
      <section className="lp-services">
        <div className="lp-services-inner">
          <div ref={addRef} className="lp-fade lp-services-head">
            <p className="lp-section-label">SERVICES</p>
            <h2 className="lp-section-title">EmoLens의 핵심 서비스</h2>
          </div>

          <div className="lp-services-grid">
            {SERVICES.map((s, i) => (
              <div
                ref={addRef}
                key={i}
                className="lp-fade lp-service-card"
                style={{ background: s.bg, transitionDelay: `${i * 100}ms` }}
              >
                {/* 어두운 그라데이션 오버레이 */}
                <div className="lp-sc-overlay" />
                {/* 카드 내용 — 좌하단 */}
                <div className="lp-sc-content">
                  <span className="lp-sc-tag">{s.tag}</span>
                  <h3 className="lp-sc-title">{s.title}</h3>
                  <p className="lp-sc-desc">{s.desc}</p>
                  <button className="lp-sc-btn" onClick={() => navigate('/write')}>
                    자세히 보기 →
                  </button>
                </div>
                {/* 카드 장식 숫자 */}
                <span className="lp-sc-num">0{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          07. WIDE BANNER CARD — 가로형 이미지 배너
      ══════════════════════════════════════════════════ */}
      <section className="lp-wide-banner">
        <div ref={addRef} className="lp-fade lp-wb-card">
          <div className="lp-wb-bg" />
          <div className="lp-wb-overlay" />
          <div className="lp-wb-content">
            <p className="lp-wb-eyebrow">PREMIUM</p>
            <h2 className="lp-wb-title">
              더 깊이 이해하고 싶다면,<br />
              EmoLens Premium
            </h2>
            <p className="lp-wb-desc">
              주간·월간 리포트, 90일 감정 그래프, 심층 AI 분석까지.<br />
              14일 무료 체험으로 직접 경험해보세요.
            </p>
            <button className="lp-wb-cta" onClick={() => navigate('/premium')}>
              Premium 알아보기
            </button>
          </div>
          <div className="lp-wb-badge">
            <span>14일</span>
            <span>무료 체험</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          08. NEWS / PR — 흰 배경, 카드 리스트
      ══════════════════════════════════════════════════ */}
      <section className="lp-news">
        <div className="lp-news-inner">
          <div ref={addRef} className="lp-fade lp-news-head">
            <div>
              <p className="lp-section-label">NEWS & UPDATE</p>
              <h2 className="lp-section-title">최신 소식</h2>
            </div>
            <a href="#" className="lp-news-more">전체 보기 →</a>
          </div>

          <div className="lp-news-grid">
            {NEWS.map((n, i) => (
              <div ref={addRef} key={i} className="lp-fade lp-news-card" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="lp-nc-top">
                  <span className="lp-nc-category">{n.category}</span>
                  <span className="lp-nc-date">{n.date}</span>
                </div>
                <h3 className="lp-nc-title">{n.title}</h3>
                <p className="lp-nc-desc">{n.desc}</p>
                <a href="#" className="lp-nc-link">자세히 →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          09. PARTNER LOGOS — 라이트 그레이 배경, 로고 그리드
      ══════════════════════════════════════════════════ */}
      <section className="lp-partners">
        <div ref={addRef} className="lp-fade lp-partners-inner">
          <p className="lp-partners-label">함께하는 파트너</p>
          <div className="lp-partners-grid">
            {PARTNERS.map((p, i) => (
              <div key={i} className="lp-partner-item">
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          10. CTA — 매우 큰 타이포, 우하단 원형 버튼
      ══════════════════════════════════════════════════ */}
      <section className="lp-cta">
        <div ref={addRef} className="lp-fade lp-cta-inner">
          <p className="lp-cta-eyebrow">GET STARTED</p>
          <h2 className="lp-cta-title">
            지금, 당신의<br />
            감정을 기록하세요
          </h2>
          <p className="lp-cta-desc">
            매일 5분의 기록이 1년 후 당신을 바꿉니다.
          </p>
        </div>
        <button className="lp-cta-circle" onClick={() => navigate('/write')}>
          <span className="lp-cta-circle-text">시작하기</span>
          <span className="lp-cta-circle-arrow">↗</span>
        </button>
      </section>

      {/* ══════════════════════════════════════════════════
          11. FOOTER — 검정 배경, 멀티 컬럼
      ══════════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">

          {/* 로고 + 설명 */}
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <span className="lp-logo-dot" />
              EmoLens
            </div>
            <p className="lp-footer-tagline">
              감정을 기록하고,<br />
              당신을 더 잘 이해하세요.
            </p>
            <div className="lp-footer-socials">
              {['Instagram', 'Twitter', 'LinkedIn'].map((s) => (
                <a key={s} href="#" className="lp-footer-social">{s}</a>
              ))}
            </div>
          </div>

          {/* 링크 컬럼들 */}
          {[
            { title: '서비스', links: ['일기 작성', 'AI 채팅', '감정 통계', 'Premium'] },
            { title: '회사',   links: ['소개', '채용', '블로그', '뉴스룸'] },
            { title: '지원',   links: ['이용 가이드', 'FAQ', '문의하기', '개인정보처리방침'] },
          ].map((col) => (
            <div key={col.title} className="lp-footer-col">
              <h4 className="lp-footer-col-title">{col.title}</h4>
              <ul className="lp-footer-links">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="lp-footer-link">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}

          {/* 뉴스레터 */}
          <div className="lp-footer-col lp-footer-newsletter">
            <h4 className="lp-footer-col-title">뉴스레터</h4>
            <p className="lp-footer-nl-desc">감정 케어 인사이트를 매주 받아보세요</p>
            <div className="lp-footer-nl-form">
              <input type="email" placeholder="이메일 주소" className="lp-footer-nl-input" />
              <button className="lp-footer-nl-btn">구독</button>
            </div>
          </div>

        </div>

        {/* 하단 라인 */}
        <div className="lp-footer-bottom">
          <p>© 2026 EmoLens Inc. All rights reserved.</p>
          <p>서울특별시 강남구 테헤란로 · contact@emolens.ai</p>
        </div>
      </footer>

    </div>
  );
}
