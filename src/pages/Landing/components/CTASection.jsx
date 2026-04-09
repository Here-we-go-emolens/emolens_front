import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{ backgroundColor: '#FDF6EF' }}>
      {/* 큰 곡선형 브라운 배경 오브젝트 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 rounded-t-[60px]"
        style={{ backgroundColor: '#5A2D1A' }}
      />
      <div
        className="absolute bottom-40 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-10"
        style={{ backgroundColor: '#E8834A' }}
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* 상단 콘텐츠 */}
        <div className="mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ backgroundColor: '#F5E8D8', color: '#A0622A' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#E8834A' }} />
            지금 바로 시작해요
          </div>

          <h2
            className="text-3xl md:text-5xl font-bold mb-5 leading-tight"
            style={{ color: '#3D1F0F', letterSpacing: '-0.04em' }}
          >
            오늘 하루,<br />
            <span style={{ color: '#E8834A' }}>기록</span>으로 남겨요
          </h2>

          <p className="text-base md:text-lg mb-8 max-w-md mx-auto" style={{ color: '#8B6348', lineHeight: 1.8 }}>
            매일 조금씩 쌓이는 기록이<br />
            나를 더 잘 이해하는 힘이 돼요.
          </p>

          {/* 점선 강조 */}
          <div className="flex justify-center mb-8">
            <div
              className="h-0.5 w-24"
              style={{ background: 'repeating-linear-gradient(to right, #E8834A 0px, #E8834A 6px, transparent 6px, transparent 12px)' }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 rounded-full text-white font-semibold text-base text-center transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: '#E8834A', boxShadow: '0 4px 20px rgba(232,131,74,0.4)' }}
            >
              무료로 시작하기 →
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-full font-medium text-base text-center border transition-all"
              style={{ color: '#8B6348', borderColor: '#D4B89A', backgroundColor: 'transparent' }}
            >
              로그인
            </Link>
          </div>

          <p className="mt-4 text-xs" style={{ color: '#B08060' }}>
            신용카드 불필요 · 무료 플랜 영구 제공
          </p>
        </div>

        {/* 하단 브라운 배경 위 텍스트 */}
        <div className="relative">
          <div className="relative z-10 pt-8">
            <div className="flex justify-center gap-8 mb-2">
              {[
                { icon: '🌿', text: '매일 기록' },
                { icon: '✨', text: 'AI 분석' },
                { icon: '💛', text: '감정 성장' },
              ].map(({ icon, text }, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs font-medium" style={{ color: '#C4956A' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
