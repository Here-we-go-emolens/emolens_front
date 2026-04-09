const weekData = [
  { day: '월', score: 62, emoji: '😐' },
  { day: '화', score: 75, emoji: '😊' },
  { day: '수', score: 50, emoji: '😔' },
  { day: '목', score: 88, emoji: '😄' },
  { day: '금', score: 71, emoji: '😌' },
  { day: '토', score: 90, emoji: '🌟' },
  { day: '일', score: 68, emoji: '😴' },
];

const diaryEntries = [
  {
    date: '4월 7일 월요일',
    emotion: '평온',
    emotionIcon: '😌',
    preview: '오늘은 생각보다 차분한 하루였어요. 아침 루틴을 지켰고 오후엔 집중이 잘 됐어요.',
    tags: ['집중', '루틴'],
    color: '#E8834A',
  },
  {
    date: '4월 6일 일요일',
    emotion: '기쁨',
    emotionIcon: '😊',
    preview: '오랜만에 친구와 만나서 즐거운 시간을 보냈어요. 카페에서 이런저런 이야기를 나눴어요.',
    tags: ['사람', '휴식'],
    color: '#D4956A',
  },
  {
    date: '4월 5일 토요일',
    emotion: '설렘',
    emotionIcon: '🌟',
    preview: '새로운 책을 시작했어요. 첫 장부터 마음에 쏙 드는 문장들이 가득해서 기분이 좋아졌어요.',
    tags: ['독서', '영감'],
    color: '#B8724A',
  },
];

const habits = [
  { name: '아침 운동', icon: '🏃', done: 5, total: 7, color: '#E8834A' },
  { name: '독서 30분', icon: '📚', done: 6, total: 7, color: '#D4956A' },
  { name: '명상', icon: '🧘', done: 4, total: 7, color: '#B8724A' },
  { name: '일기 쓰기', icon: '✍️', done: 7, total: 7, color: '#A0622A' },
];

function WeeklyChart() {
  const max = 100;
  return (
    <div
      className="rounded-3xl p-5"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #F0DACA', boxShadow: '0 2px 16px rgba(180,112,70,0.06)' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs" style={{ color: '#B08060' }}>이번 주 감정 지수</p>
          <p className="text-lg font-bold" style={{ color: '#3D1F0F' }}>평균 72점</p>
        </div>
        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ backgroundColor: '#FEF0E6', color: '#E8834A' }}
        >
          +8 지난주 대비
        </span>
      </div>

      <div className="flex items-end gap-2 h-28 mb-2">
        {weekData.map(({ day, score }, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${(score / max) * 80}px`,
                  backgroundColor: i === 5 ? '#E8834A' : '#F0DACA',
                }}
              />
            </div>
            <span className="text-[10px]" style={{ color: '#B08060' }}>{day}</span>
          </div>
        ))}
      </div>

      {/* 점선 */}
      <div
        className="h-px"
        style={{ background: 'repeating-linear-gradient(to right, #E8834A 0px, #E8834A 5px, transparent 5px, transparent 10px)' }}
      />
    </div>
  );
}

function DiaryList() {
  return (
    <div
      className="rounded-3xl p-5"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #F0DACA', boxShadow: '0 2px 16px rgba(180,112,70,0.06)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-semibold" style={{ color: '#3D1F0F' }}>최근 기록</p>
        <button className="text-xs" style={{ color: '#E8834A' }}>전체보기</button>
      </div>
      <div className="space-y-3">
        {diaryEntries.map((entry, i) => (
          <div
            key={i}
            className="rounded-2xl p-3 flex gap-3 items-start"
            style={{ backgroundColor: '#FDF6EF' }}
          >
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: '#FFF8F2' }}
            >
              {entry.emotionIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-[10px]" style={{ color: '#B08060' }}>{entry.date}</p>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#FEF0E6', color: entry.color }}
                >
                  {entry.emotion}
                </span>
              </div>
              <p className="text-xs leading-relaxed truncate" style={{ color: '#5A3A28' }}>
                {entry.preview}
              </p>
              <div className="flex gap-1 mt-1.5">
                {entry.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="text-[8px] px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#F5E8D8', color: '#A0622A' }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HabitTracker() {
  return (
    <div
      className="rounded-3xl p-5"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #F0DACA', boxShadow: '0 2px 16px rgba(180,112,70,0.06)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-semibold" style={{ color: '#3D1F0F' }}>이번 주 습관</p>
        <span className="text-[10px]" style={{ color: '#B08060' }}>4월 1~7일</span>
      </div>
      <div className="space-y-3">
        {habits.map(({ name, icon, done, total, color }, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="text-xs font-medium" style={{ color: '#5A3A28' }}>{name}</span>
              </div>
              <span className="text-[10px]" style={{ color: '#B08060' }}>{done}/{total}일</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: '#F5EDE5' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${(done / total) * 100}%`, backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsightCard() {
  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden"
      style={{ backgroundColor: '#3D1F0F', boxShadow: '0 4px 24px rgba(61,31,15,0.15)' }}
    >
      {/* 배경 장식 */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
        style={{ backgroundColor: '#E8834A' }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <p className="text-xs font-semibold" style={{ color: '#F5C5A3' }}>AI 주간 인사이트</p>
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#FDF6EF' }}>
          이번 주는 <span style={{ color: '#F5A874' }}>토요일 감정 지수</span>가 가장 높았어요. 주말 여유가 감정에 긍정적인 영향을 주는 패턴이 보여요. 수요일 저점을 완화할 작은 루틴을 만들어보는 건 어떨까요?
        </p>
        <div
          className="h-px mb-3"
          style={{ background: 'repeating-linear-gradient(to right, #E8834A 0px, #E8834A 4px, transparent 4px, transparent 8px)' }}
        />
        <div className="flex gap-3">
          {[
            { label: '연속 기록', value: '14일', icon: '🔥' },
            { label: '이번 주 감정', value: '72점', icon: '💛' },
            { label: '달성 습관', value: '4개', icon: '✅' },
          ].map(({ label, value, icon }, i) => (
            <div key={i} className="flex-1 text-center">
              <p className="text-lg">{icon}</p>
              <p className="text-sm font-bold" style={{ color: '#FDF6EF' }}>{value}</p>
              <p className="text-[9px]" style={{ color: '#C4956A' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPreviewSection() {
  return (
    <section
      id="preview"
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ backgroundColor: '#F5EBE0' }}
    >
      {/* 배경 장식 */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
        style={{ backgroundColor: '#D4A878' }}
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ backgroundColor: '#F5E8D8', color: '#A0622A' }}
          >
            웹앱 미리보기
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#3D1F0F', letterSpacing: '-0.04em' }}
          >
            나의 감정 대시보드
          </h2>
          <p className="text-base" style={{ color: '#8B6348' }}>
            기록이 쌓일수록 나를 더 잘 알게 돼요
          </p>
        </div>

        {/* 대시보드 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 좌측: 주간 차트 + 습관 */}
          <div className="space-y-5">
            <WeeklyChart />
            <HabitTracker />
          </div>

          {/* 중앙: 일기 목록 */}
          <div>
            <DiaryList />
          </div>

          {/* 우측: AI 인사이트 + 통계 */}
          <div className="space-y-5">
            <AIInsightCard />

            {/* 감정 분포 */}
            <div
              className="rounded-3xl p-5"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #F0DACA', boxShadow: '0 2px 16px rgba(180,112,70,0.06)' }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: '#3D1F0F' }}>이번 달 감정 분포</p>
              <div className="space-y-2">
                {[
                  { label: '평온', pct: 42, color: '#E8834A' },
                  { label: '기쁨', pct: 28, color: '#D4956A' },
                  { label: '우울', pct: 18, color: '#C4815A' },
                  { label: '기타', pct: 12, color: '#F0DACA' },
                ].map(({ label, pct, color }, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] w-10" style={{ color: '#B08060' }}>{label}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#F5EDE5' }}>
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[10px] w-6 text-right" style={{ color: '#B08060' }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
