export default function LandingFooter() {
  return (
    <footer style={{ backgroundColor: '#5A2D1A' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* 브랜드 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: '#E8834A' }}
              >
                E
              </div>
              <span className="text-lg font-semibold text-white" style={{ letterSpacing: '-0.03em' }}>
                emolens
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#C4956A' }}>
              매일의 감정을 부드럽게 기록하고<br />
              나를 이해하는 여정을 함께해요.
            </p>
            {/* 점선 */}
            <div
              className="mt-4 h-0.5 w-16"
              style={{ background: 'repeating-linear-gradient(to right, #E8834A 0px, #E8834A 4px, transparent 4px, transparent 8px)' }}
            />
          </div>

          {/* 링크 그룹 */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#A07050' }}>
              서비스
            </p>
            <ul className="space-y-2">
              {['기능 소개', '가격 안내', '블로그', '업데이트'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: '#C4956A' }}
                    onMouseEnter={e => e.target.style.color = '#F5C5A3'}
                    onMouseLeave={e => e.target.style.color = '#C4956A'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#A07050' }}>
              지원
            </p>
            <ul className="space-y-2">
              {['자주 묻는 질문', '개인정보 처리방침', '이용약관', '문의하기'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: '#C4956A' }}
                    onMouseEnter={e => e.target.style.color = '#F5C5A3'}
                    onMouseLeave={e => e.target.style.color = '#C4956A'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px mb-6" style={{ backgroundColor: '#7A4030' }} />

        {/* 하단 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs" style={{ color: '#A07050' }}>
            © 2026 emolens. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#A07050' }}>
            감정을 기록하는 가장 따뜻한 방법 🌿
          </p>
        </div>
      </div>
    </footer>
  );
}
