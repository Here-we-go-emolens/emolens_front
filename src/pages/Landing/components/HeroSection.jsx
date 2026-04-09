import { Link } from 'react-router-dom';

function PhoneMockup() {
  return (
    <div
      className="relative mx-auto"
      style={{ width: 220, height: 440 }}
    >
      {/* 폰 외관 */}
      <div
        className="absolute inset-0 rounded-[2.5rem] shadow-xl border-4"
        style={{
          backgroundColor: '#FDFAF7',
          borderColor: '#D4B89A',
        }}
      />
      {/* 노치 */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full z-10"
        style={{ backgroundColor: '#D4B89A' }}
      />
      {/* 화면 영역 */}
      <div
        className="absolute inset-[4px] rounded-[2.2rem] overflow-hidden flex flex-col pt-10 px-4 pb-4 gap-3"
        style={{ backgroundColor: '#FDF6EF' }}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[9px]" style={{ color: '#B08060' }}>2026년 4월 7일 월요일</p>
            <p className="text-[12px] font-semibold" style={{ color: '#3D1F0F' }}>오늘 어떠셨나요?</p>
          </div>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ backgroundColor: '#E8834A' }}
          >
            K
          </div>
        </div>

        {/* 감정 카드 */}
        <div
          className="rounded-2xl p-3"
          style={{ backgroundColor: '#FFF8F2', border: '1px solid #F0DACA' }}
        >
          <p className="text-[8px] mb-1.5" style={{ color: '#B08060' }}>오늘의 감정</p>
          <div className="flex gap-1.5">
            {['😌', '🌟', '💛', '😴', '🌿'].map((e, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-[14px]"
                style={{ backgroundColor: i === 0 ? '#E8834A' : '#F5EDE5' }}
              >
                {e}
              </div>
            ))}
          </div>
        </div>

        {/* 회고 미리보기 */}
        <div
          className="rounded-2xl p-3 flex-1"
          style={{ backgroundColor: '#FFF8F2', border: '1px solid #F0DACA' }}
        >
          <p className="text-[8px] mb-1" style={{ color: '#B08060' }}>오늘의 회고</p>
          <p className="text-[9px] leading-relaxed" style={{ color: '#5A3A28' }}>
            오늘은 오전에 집중이 잘 됐고, 점심 이후엔 약간 지쳤어요. 그래도 저녁엔 산책을 해서 마음이 좀 편해졌어요...
          </p>
          <div
            className="mt-2 h-0.5 rounded-full w-2/3"
            style={{ backgroundColor: '#E8834A', opacity: 0.5 }}
          />
        </div>

        {/* 습관 트래커 */}
        <div
          className="rounded-2xl p-3"
          style={{ backgroundColor: '#FFF8F2', border: '1px solid #F0DACA' }}
        >
          <p className="text-[8px] mb-1.5" style={{ color: '#B08060' }}>오늘의 습관</p>
          <div className="flex gap-1">
            {['운동', '독서', '명상', '일기'].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-lg py-1 text-center text-[7px] font-medium"
                style={{
                  backgroundColor: i < 3 ? '#E8834A' : '#F5EDE5',
                  color: i < 3 ? '#fff' : '#B08060',
                }}
              >
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#FDF6EF', minHeight: '88vh' }}
    >
      {/* 배경 장식 원 */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{ backgroundColor: '#E8C5A0' }}
      />
      <div
        className="absolute top-60 -left-20 w-64 h-64 rounded-full opacity-10"
        style={{ backgroundColor: '#D4A878' }}
      />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 텍스트 */}
          <div className="order-2 md:order-1">
            {/* 배지 */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ backgroundColor: '#F5E8D8', color: '#A0622A' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#E8834A' }} />
              감정 기록 · 습관 관리 · AI 인사이트
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold leading-tight mb-5"
              style={{ color: '#3D1F0F', letterSpacing: '-0.04em' }}
            >
              매일의 감정을<br />
              <span style={{ color: '#E8834A' }}>부드럽게 기록</span>하고<br />
              나를 이해해요
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed mb-8"
              style={{ color: '#8B6348' }}
            >
              하루의 감정, 회고, 습관을 한 곳에서 기록하고<br className="hidden md:block" />
              AI가 당신의 패턴을 부드럽게 분석해드려요.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="px-7 py-3.5 rounded-full text-white font-semibold text-base text-center transition-all hover:opacity-90"
                style={{ backgroundColor: '#E8834A' }}
              >
                무료로 시작하기 →
              </Link>
              <a
                href="#features"
                className="px-7 py-3.5 rounded-full font-medium text-base text-center border transition-all"
                style={{ color: '#8B6348', borderColor: '#D4B89A', backgroundColor: 'transparent' }}
              >
                기능 살펴보기
              </a>
            </div>

            {/* 소셜 프루프 */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['#E8A87C', '#D4956A', '#C4815A', '#B47046'].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#3D1F0F' }}>2,400명+이 사용 중</p>
                <p className="text-xs" style={{ color: '#B08060' }}>매일 감정을 기록하고 있어요</p>
              </div>
            </div>
          </div>

          {/* 폰 목업 */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end relative">
            {/* 장식 점선 원 */}
            <div
              className="absolute inset-0 m-auto w-72 h-72 rounded-full opacity-30"
              style={{ border: '2px dashed #E8834A' }}
            />
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* 하단 곡선 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60 Q720 0 1440 60 L1440 60 L0 60Z" fill="#FDF6EF" />
        </svg>
      </div>
    </section>
  );
}
