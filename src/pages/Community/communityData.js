export const EMOTION_CATEGORIES = [
  {
    id: 'positive',
    emoji: '😊',
    label: '긍정',
    emotions: [
      { emoji: '🌸', label: '설렘', tone: 'excited', filterId: 'excited', pct: 41 },
      { emoji: '🙂', label: '만족', tone: 'satisfied', filterId: 'satisfied', pct: 39 },
      { emoji: '🏅', label: '뿌듯함', tone: 'proud', filterId: 'proud', pct: 36 },
      { emoji: '😊', label: '행복', tone: 'happy', filterId: 'happy', pct: 44 },
      { emoji: '✨', label: '기대감', tone: 'hopeful', filterId: 'hopeful', pct: 35 },
      { emoji: '🫶', label: '안정감', tone: 'stable', filterId: 'stable', pct: 33 },
    ],
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: '중립',
    emotions: [
      { emoji: '😌', label: '평온', tone: 'calm', filterId: 'calm', pct: 29 },
      { emoji: '😐', label: '무덤덤', tone: 'neutral', filterId: 'neutral', pct: 24 },
      { emoji: '💭', label: '생각 많음', tone: 'thoughtful', filterId: 'thoughtful', pct: 31 },
      { emoji: '🎯', label: '집중', tone: 'focused', filterId: 'focused', pct: 27 },
      { emoji: '🗓', label: '루틴', tone: 'routine', filterId: 'routine', pct: 22 },
    ],
  },
  {
    id: 'negative',
    emoji: '😔',
    label: '부정',
    emotions: [
      { emoji: '😔', label: '부담감', tone: 'burden', filterId: 'burden', pct: 62 },
      { emoji: '😰', label: '불안', tone: 'anxious', filterId: 'anxious', pct: 51 },
      { emoji: '😴', label: '피곤함', tone: 'tired', filterId: 'tired', pct: 46 },
      { emoji: '😤', label: '짜증', tone: 'irritated', filterId: 'irritated', pct: 38 },
      { emoji: '🌧', label: '우울', tone: 'down', filterId: 'down', pct: 34 },
      { emoji: '🌙', label: '외로움', tone: 'lonely', filterId: 'lonely', pct: 28 },
      { emoji: '🧩', label: '스트레스', tone: 'stress', filterId: 'stress', pct: 57 },
      { emoji: '🪫', label: '번아웃', tone: 'burnout', filterId: 'burnout', pct: 43 },
    ],
  },
];

export const EMOTION_OPTIONS = EMOTION_CATEGORIES.flatMap((category) => category.emotions);

export const EMOTION_FILTERS = [
  { id: 'all', emoji: '', label: '전체' },
  ...EMOTION_OPTIONS.map((emotion) => ({
    id: emotion.filterId,
    emoji: emotion.emoji,
    label: emotion.label,
  })),
];

export const SORT_OPTIONS = [
  { id: 'latest', label: '최신순' },
  { id: 'empathy', label: '공감순' },
  { id: 'similar', label: 'AI 연결순' },
];

export const TODAY_PICKS = [
  {
    id: 'pick-1',
    role: '공감',
    roleDesc: '오늘 부담감을 느끼는 분들이 가장 오래 머문 글이에요',
    emotionLabel: '부담감',
    similarity: 91,
    title: '발표 전날, 나도 항상 이랬어',
    content:
      '준비를 아무리 해도 떨리는 건 어쩔 수 없더라고. 그냥 그 감정이 나쁜 게 아니라는 걸 알게 됐을 때 조금 달라졌어.',
    author: '달빛여우',
    time: '오늘 오전 11시',
    reactions: { empathy: 47, comfort: 12, understand: 38, comment: 18 },
    actionCount: 23,
  },
  {
    id: 'pick-2',
    role: '인사이트',
    roleDesc: '비슷한 감정을 겪고 정리해낸 경험이 가장 많이 저장됐어요',
    emotionLabel: '부담감',
    similarity: 84,
    title: '할 일이 너무 많을 때 내가 쓰는 방법',
    content:
      '전부 다 해야 한다는 생각을 버리는 게 먼저였어. 오늘 딱 3개만 고르고 나머지는 내일로 미루는 연습을 했더니 오히려 더 많이 됐어.',
    author: '구름토끼',
    time: '어제 오후 9시',
    reactions: { empathy: 61, comfort: 8, understand: 72, comment: 26 },
    actionCount: 41,
  },
  {
    id: 'pick-3',
    role: '행동',
    roleDesc: '읽고 바로 실천한 사용자가 가장 많았던 루틴이에요',
    emotionLabel: '부담감',
    similarity: 78,
    title: '부담감 쌓일 때 나만의 5분 루틴',
    content:
      '타이머 5분 맞추고, 지금 머릿속에 있는 걱정을 전부 종이에 쏟아내. 그다음 그 중에 오늘 실제로 해결 가능한 것만 동그라미 쳐. 이것만 해도 훨씬 가벼워져.',
    author: '초록이',
    time: '어제 오후 2시',
    reactions: { empathy: 89, comfort: 31, understand: 104, comment: 47 },
    actionCount: 67,
  },
];

export const INITIAL_POSTS = [
  {
    id: 1,
    emotionLabel: '부담감',
    similarity: 87,
    title: '발표 전날 밤은 왜 이렇게 길까',
    content:
      '내일 팀 발표가 있는데 자꾸 최악의 상황만 상상돼. 준비는 다 했는데도 손이 떨리고 잠도 안 오고, 머릿속에서는 실수한 장면만 반복돼요. 비슷한 감정 겪었던 분들은 어떻게 넘겼는지 듣고 싶어요.',
    tags: ['발표', '불안', '마감'],
    author: '달빛여우',
    time: '23분 전',
    matchReason: '발표와 마감 압박이 함께 감지된 글이라 지금 감정과 가장 가깝게 연결됐어요.',
    reactions: { empathy: 24, comfort: 8, understand: 31, comment: 12 },
  },
  {
    id: 2,
    emotionLabel: '불안',
    similarity: 71,
    title: '요즘 아무것도 제대로 못하는 것 같아서 더 초조해져요',
    content:
      '열심히 하는데 결과가 안 나오니까 점점 자신감이 떨어지는 것 같아. 하루를 시작하기도 전에 내가 뒤처진 것 같은 기분이 들고, 작은 실수 하나에도 하루 종일 마음이 흔들려요.',
    tags: ['자신감', '비교', '초조함'],
    author: '구름달',
    time: '1시간 전',
    matchReason: '자기비판과 불안이 함께 표현돼, 위로 반응이 많이 이어지는 흐름이에요.',
    reactions: { empathy: 41, comfort: 19, understand: 58, comment: 23 },
  },
  {
    id: 3,
    emotionLabel: '피곤함',
    similarity: 54,
    title: '번아웃인지 그냥 게으른 건지 구분이 안 돼요',
    content:
      '쉬어도 쉰 것 같지 않고, 뭔가 계속 해야 할 것 같은 느낌인데 정작 아무것도 못 하고 있어요. 해야 한다는 생각만 머릿속을 빙빙 돌고 몸은 더 굳어지는 느낌이에요.',
    tags: ['번아웃', '무기력', '휴식'],
    author: '솔잎향기',
    time: '3시간 전',
    matchReason: '피곤함과 무기력 조합이라, 비슷한 사용자들이 행동 팁을 많이 남긴 글이에요.',
    reactions: { empathy: 67, comfort: 34, understand: 89, comment: 31 },
  },
  {
    id: 4,
    emotionLabel: '평온',
    similarity: 43,
    title: '오늘은 해야 할 일을 다 못 했는데도 마음이 조금 괜찮았어요',
    content:
      '예전 같았으면 스스로를 더 몰아붙였을 텐데, 오늘은 할 수 있는 만큼 했다고 생각하니 오히려 숨이 트였어요. 비슷하게 마음을 정리한 경험이 있다면 나눠주세요.',
    tags: ['회복', '마음정리', '자기돌봄'],
    author: '은하수',
    time: '5시간 전',
    matchReason: '회복 단계의 글이라, 지금 감정에서 벗어난 뒤의 흐름을 참고하기 좋아요.',
    reactions: { empathy: 52, comfort: 27, understand: 46, comment: 17 },
  },
  {
    id: 5,
    emotionLabel: '설렘',
    similarity: 38,
    title: '처음으로 내가 기대되는 하루였어요',
    content:
      '오랜만에 아침부터 마음이 가볍고 뭔가 해낼 수 있을 것 같은 기분이 들었어요. 이런 감정을 오래 붙잡는 방법이 있다면 같이 나누고 싶어요.',
    tags: ['기대감', '새출발', '아침'],
    author: '햇살온도',
    time: '어제 오후 5시',
    matchReason: '긍정 감정이 길게 유지되는 글이라, 회복 이후 흐름을 보는 데 도움이 돼요.',
    reactions: { empathy: 33, comfort: 9, understand: 21, comment: 14 },
  },
  {
    id: 6,
    emotionLabel: '스트레스',
    similarity: 76,
    title: '계속 참다가 결국 오늘 한 번에 터졌어요',
    content:
      '작은 일은 넘기려 했는데 하루 종일 쌓이다 보니 결국 퇴근하고 나서 아무 말도 하기 싫어졌어요. 이렇게 꽉 찬 감정은 어떻게 풀어야 할까요.',
    tags: ['퇴근', '감정폭발', '회복'],
    author: '저녁바람',
    time: '어제 오전 10시',
    matchReason: '스트레스와 피곤함이 함께 있는 글이라, 현재 부정 감정 흐름과 가깝게 분류됐어요.',
    reactions: { empathy: 58, comfort: 26, understand: 63, comment: 28 },
  },
];

export const INITIAL_COMMENTS_BY_POST = {
  1: [
    {
      id: 101,
      author: '은하수',
      content: '저도 발표 전날엔 꼭 숨이 가빠져요. 그래서 시작 전에 첫 문장만 크게 읽고 들어가요.',
      createdAt: '12분 전',
      isHidden: false,
    },
    {
      id: 102,
      author: '구름토끼',
      content: '완벽하게 하려는 마음이 더 긴장을 키우더라고요. 적당히 해도 괜찮다고 스스로 말해줘 보세요.',
      createdAt: '7분 전',
      isHidden: false,
    },
  ],
  2: [
    {
      id: 201,
      author: '초록이',
      content: '결과가 늦게 따라오는 시기일 수도 있어요. 지금 하고 있는 루틴이 있으면 그거 하나만 유지해도 충분해요.',
      createdAt: '34분 전',
      isHidden: false,
    },
  ],
  3: [
    {
      id: 301,
      author: '달빛여우',
      content: '번아웃일 때는 쉬는 것도 해야 할 일처럼 느껴지더라고요. 오늘은 정말 하나만 해보면 어때요?',
      createdAt: '1시간 전',
      isHidden: false,
    },
  ],
};

export const AI_INSIGHT_BY_EMOTION = {
  부담감: {
    badge: 'AI 감정 인사이트',
    summary: '최근 "부담감" 감정이 가장 많이 나타나고 있어요.',
    context: '발표, 마감 관련 글에서 자주 나타나요.',
    actions: ['5분 호흡', '우선순위 3개 정리'],
  },
  불안: {
    badge: 'AI 감정 인사이트',
    summary: '최근 "불안" 감정이 자주 감지되고 있어요.',
    context: '비교, 결과 걱정, 작은 실수에 대한 글에서 많이 보여요.',
    actions: ['걱정 3줄 적기', '오늘 끝낼 일 1개만 정하기'],
  },
  피곤함: {
    badge: 'AI 감정 인사이트',
    summary: '최근 "피곤함" 감정이 길게 이어지는 흐름이 많아요.',
    context: '루틴이 무너진 날이나 과부하가 쌓인 글에서 자주 나타나요.',
    actions: ['10분 눈 감고 쉬기', '오늘 할 일 하나 덜어내기'],
  },
  평온: {
    badge: 'AI 감정 인사이트',
    summary: '최근 "평온" 감정은 회복 이후 기록에서 많이 보여요.',
    context: '산책, 루틴 회복, 스스로를 다독인 글에서 자주 나타나요.',
    actions: ['지금 괜찮았던 순간 적기', '내일도 유지할 루틴 1개 정하기'],
  },
};

export function getEmotionByLabel(label) {
  return EMOTION_OPTIONS.find((emotion) => emotion.label === label) ?? EMOTION_OPTIONS[0];
}

export function getEmotionCategoryId(label) {
  const category = EMOTION_CATEGORIES.find((item) =>
    item.emotions.some((emotion) => emotion.label === label),
  );
  return category?.id ?? EMOTION_CATEGORIES[0].id;
}

export function getFilterFromEmotion(label) {
  return getEmotionByLabel(label).filterId;
}

export function hydratePost(post) {
  return {
    ...post,
    emotion: getEmotionByLabel(post.emotionLabel),
    comments: post.reactions.comment,
  };
}
