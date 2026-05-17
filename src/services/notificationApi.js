// 백엔드 미구현 — localStorage 기반 목업
const STORAGE_KEY = 'emolens_notifications';

const MOCK = [
  {
    id: 1,
    type: 'LETTER',
    title: '편지가 도착했어요 💌',
    body: 'AI 친구가 따뜻한 편지를 보냈어요',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    link: '/letters',
  },
  {
    id: 2,
    type: 'ANALYSIS',
    title: '일기 분석이 완료됐어요',
    body: '오늘 작성한 일기의 감정 분석 결과를 확인해보세요',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/diary/latest',
  },
  {
    id: 3,
    type: 'WEEKLY',
    title: '주간 리포트가 생성됐어요',
    body: '이번 주 감정 흐름을 AI가 분석했어요',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/weekly-report',
  },
  {
    id: 4,
    type: 'ANALYSIS',
    title: '일기 분석이 완료됐어요',
    body: '어제 작성한 일기의 감정 분석이 도착했어요',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    link: '/diary/latest',
  },
  {
    id: 5,
    type: 'WEEKLY',
    title: '지난 주 리포트를 확인해보세요',
    body: '지난 주 감정 패턴과 변화를 살펴보세요',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    link: '/weekly-report',
  },
  {
    id: 6,
    type: 'LETTER',
    title: '편지가 도착했어요 💌',
    body: '읽지 않은 편지가 있어요. 확인해보세요',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    link: '/letters',
  },
];

function getReadSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveReadSet(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function getNotifications() {
  const readSet = getReadSet();
  return Promise.resolve(
    MOCK.map(n => ({ ...n, isRead: readSet.has(n.id) }))
  );
}

export function getUnreadNotificationCount() {
  const readSet = getReadSet();
  return Promise.resolve(MOCK.filter(n => !readSet.has(n.id)).length);
}

export function markAsRead(id) {
  const readSet = getReadSet();
  readSet.add(id);
  saveReadSet(readSet);
  return Promise.resolve();
}

export function markAllAsRead() {
  saveReadSet(new Set(MOCK.map(n => n.id)));
  return Promise.resolve();
}
