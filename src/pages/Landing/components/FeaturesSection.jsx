const features = [
  {
    id: 'reflection',
    badge: '성찰 모드',
    icon: '🌙',
    title: '하루를\n조용히 되돌아봐요',
    desc: '하루가 끝날 때, AI와 함께 오늘 있었던 일을 천천히 풀어보세요. 강요 없이, 판단 없이.',
    accent: '#E8834A',
    mockup: <ReflectionMockup />,
  },
  {
    id: 'diary',
    badge: '오늘의 회고',
    icon: '📖',
    title: '감정 기록이\n이렇게 쉬울 수도',
    desc: '복잡한 감정도 몇 가지 선택지와 짧은 텍스트로 충분해요. 매일 쌓이면 나만의 이야기가 돼요.',
    accent: '#D4956A',
    mockup: <DiaryMockup />,
  },
  {
    id: 'insight',
    badge: 'AI 인사이트',
    icon: '✨',
    title: 'AI가 읽어주는\n나의 감정 패턴',
    desc: '주간·월간 기록을 AI가 분석해 당신이 몰랐던 감정 흐름을 부드럽게 알려드려요.',
    accent: '#B8724A',
    mockup: <InsightMockup />,
  },
];

function ReflectionMockup() {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#FFF8F2', border: '1.5px solid #F0DACA' }}>
      <p className="text-xs font-semibold" style={{ color: '#3D1F0F' }}>오늘 어떤 하루였나요?</p>
      <div className="space-y-2">
        {[
          { q: '가장 인상 깊었던 순간은?', a: '오후에 카페에서 혼자 책 읽은 시간' },
          { q: '오늘 감사한 일은?', a: '따뜻한 햇살이 유리창으로 들어왔어요' },
        ].map(({ q, a }, i) => (
          <div key={i} className="rounded-xl p-2.5" style={{ backgroundColor: '#FDF6EF' }}>
            <p className="text-[9px] mb-0.5" style={{ color: '#B08060' }}>{q}</p>
            <p className="text-[10px]" style={{ color: '#5A3A28' }}>{a}</p>
          </div>
        ))}
      </div>
      <div
        className="h-0.5 rounded-full"
        style={{ background: 'repeating-linear-gradient(to right, #E8834A 0px, #E8834A 6px, transparent 6px, transparent 12px)' }}
      />
    </div>
  );
}

function DiaryMockup() {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#FFF8F2', border: '1.5px solid #F0DACA' }}>
      <div className="flex justify-between items-center">
        <p className="text-xs font-semibold" style={{ color: '#3D1F0F' }}>오늘의 감정</p>
        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5E8D8', color: '#A0622A' }}>월요일</span>
      </div>
      <div className="flex gap-2">
        {[
          { icon: '😌', label: '평온', active: true },
          { icon: '😊', label: '기쁨', active: false },
          { icon: '😔', label: '우울', active: false },
          { icon: '😤', label: '불안', active: false },
        ].map(({ icon, label, active }, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-center"
            style={{ backgroundColor: active ? '#E8834A' : '#F5EDE5' }}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-[8px] font-medium" style={{ color: active ? '#fff' : '#B08060' }}>{label}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-2.5" style={{ backgroundColor: '#FDF6EF' }}>
        <p className="text-[9px]" style={{ color: '#5A3A28' }}>
          오늘은 생각보다 여유로운 하루였어요. 아침에 커피를 마시며...
        </p>
      </div>
    </div>
  );
}

function InsightMockup() {
  const bars = [65, 80, 45, 90, 70, 55, 85];
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#FFF8F2', border: '1.5px solid #F0DACA' }}>
      <div className="flex justify-between items-center">
        <p className="text-xs font-semibold" style={{ color: '#3D1F0F' }}>이번 주 감정 흐름</p>
        <span className="text-[9px]" style={{ color: '#B08060' }}>4월 1주</span>
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-lg"
              style={{
                height: `${h * 0.56}px`,
                backgroundColor: i === 3 ? '#E8834A' : '#F0DACA',
              }}
            />
            <span className="text-[7px]" style={{ color: '#B08060' }}>{days[i]}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-2.5" style={{ backgroundColor: '#FDF6EF' }}>
        <p className="text-[9px] leading-relaxed" style={{ color: '#5A3A28' }}>
          ✨ 목요일 감정이 가장 높았어요. 이 날 특별한 일이 있었나요?
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ feature }) {
  return (
    <div className="flex flex-col gap-5">
      {/* 뱃지 + 아이콘 */}
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
          style={{ backgroundColor: '#F5E8D8' }}
        >
          {feature.icon}
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: '#FEF0E6', color: feature.accent }}
        >
          {feature.badge}
        </span>
      </div>

      {/* 제목 */}
      <div>
        <h3
          className="text-xl font-bold leading-snug mb-2 whitespace-pre-line"
          style={{ color: '#3D1F0F', letterSpacing: '-0.03em' }}
        >
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: '#8B6348' }}>
          {feature.desc}
        </p>
      </div>

      {/* 점선 강조 */}
      <div
        className="h-0.5 rounded-full w-16"
        style={{ background: `repeating-linear-gradient(to right, ${feature.accent} 0px, ${feature.accent} 4px, transparent 4px, transparent 8px)` }}
      />

      {/* 목업 */}
      <div className="mt-auto">
        {feature.mockup}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28" style={{ backgroundColor: '#FFFAF5' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ backgroundColor: '#F5E8D8', color: '#A0622A' }}
          >
            핵심 기능
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#3D1F0F', letterSpacing: '-0.04em' }}
          >
            감정 기록, 이제 부담 없이
          </h2>
          <p className="text-base" style={{ color: '#8B6348' }}>
            세 가지 모드로 오늘 하루를 담아요
          </p>
        </div>

        {/* 3열 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="rounded-3xl p-6 flex flex-col gap-5 transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #F0DACA',
                boxShadow: '0 2px 16px rgba(180, 112, 70, 0.06)',
              }}
            >
              <FeatureCard feature={feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
