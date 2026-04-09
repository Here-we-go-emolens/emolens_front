// ============================================================
//  friendSocket.js
//  실제 WebSocket 연결 + Mock 모드 지원
// ============================================================

const MOCK_FRIENDS_INITIAL = [
  {
    id: 1,
    name: '구름위에서',
    tag: '#2847',
    emotion: '😊',
    emotionLabel: '행복',
    emotionColor: 'happy',
    status: 'online',
    lastActive: '방금 전',
    unreadCount: 0,
  },
  {
    id: 2,
    name: '별빛여행자',
    tag: '#1023',
    emotion: '😔',
    emotionLabel: '우울',
    emotionColor: 'sad',
    status: 'offline',
    lastActive: '2시간 전',
    unreadCount: 2,
  },
  {
    id: 3,
    name: '조용한숲',
    tag: '#5531',
    emotion: '🥰',
    emotionLabel: '설렘',
    emotionColor: 'excited',
    status: 'online',
    lastActive: '방금 전',
    unreadCount: 0,
  },
  {
    id: 4,
    name: '파란하늘',
    tag: '#7792',
    emotion: '😌',
    emotionLabel: '평온',
    emotionColor: 'calm',
    status: 'away',
    lastActive: '5분 전',
    unreadCount: 1,
  },
  {
    id: 5,
    name: '새벽달빛',
    tag: '#3344',
    emotion: '😤',
    emotionLabel: '부담',
    emotionColor: 'stressed',
    status: 'offline',
    lastActive: '1일 전',
    unreadCount: 0,
  },
];

const EMOTIONS = [
  { emoji: '😊', label: '행복',   color: 'happy'    },
  { emoji: '😔', label: '우울',   color: 'sad'      },
  { emoji: '🥰', label: '설렘',   color: 'excited'  },
  { emoji: '😌', label: '평온',   color: 'calm'     },
  { emoji: '😴', label: '피곤',   color: 'tired'    },
  { emoji: '😰', label: '불안',   color: 'anxious'  },
  { emoji: '🤗', label: '안정',   color: 'stable'   },
  { emoji: '😤', label: '부담',   color: 'stressed' },
];

const MESSAGES = [
  '오늘 괜찮아?',
  '힘내! 응원해 ✨',
  '같이 일기 써요',
  '오늘 하루도 수고했어요',
  '요즘 어때?',
];

const LAST_ACTIVE_LABELS = ['방금 전', '1분 전', '3분 전', '10분 전', '30분 전'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 이벤트 생성기 목록
const MOCK_EVENT_GENERATORS = [
  // friend_status_changed (가장 자주 발생)
  () => ({
    type: 'friend_status_changed',
    payload: {
      id: Math.ceil(Math.random() * 5),
      status: pickRandom(['online', 'offline', 'away']),
      lastActive: pickRandom(LAST_ACTIVE_LABELS),
    },
  }),
  () => ({
    type: 'friend_status_changed',
    payload: {
      id: Math.ceil(Math.random() * 5),
      status: pickRandom(['online', 'away']),
      lastActive: '방금 전',
    },
  }),
  // friend_emotion_updated
  () => {
    const em = pickRandom(EMOTIONS);
    return {
      type: 'friend_emotion_updated',
      payload: {
        id: Math.ceil(Math.random() * 5),
        emotion: em.emoji,
        emotionLabel: em.label,
        emotionColor: em.color,
      },
    };
  },
  // friend_message_received
  () => ({
    type: 'friend_message_received',
    payload: {
      id: Math.ceil(Math.random() * 5),
      message: pickRandom(MESSAGES),
      unreadCount: 1,
    },
  }),
];

// ──────────────────────────────────────────────────────────
//  Public API
// ──────────────────────────────────────────────────────────

/**
 * friendSocket 생성
 * @param {object} opts
 * @param {boolean}  opts.mock     - mock 모드 여부 (기본 true)
 * @param {string}   opts.wsUrl    - 실제 WebSocket URL (mock=false 시 필요)
 * @param {Function} opts.onOpen   - 연결 성공 콜백
 * @param {Function} opts.onClose  - 연결 종료 콜백
 * @param {Function} opts.onMessage - 이벤트 수신 콜백 ({ type, payload })
 * @returns {{ close: Function }}
 */
export function createFriendSocket({ mock = true, wsUrl, onOpen, onClose, onMessage }) {
  if (mock) {
    return createMockSocket({ onOpen, onMessage });
  }
  return createRealSocket({ wsUrl, onOpen, onClose, onMessage });
}

// ──────────────────────────────────────────────────────────
//  Mock Socket
// ──────────────────────────────────────────────────────────
function createMockSocket({ onOpen, onClose, onMessage }) {
  let intervalId = null;

  // 600ms 후 연결 성공 + 초기 데이터 전송
  const openTimer = setTimeout(() => {
    onOpen && onOpen();
    onMessage({
      type: 'initial_data',
      payload: { friends: MOCK_FRIENDS_INITIAL },
    });

    // 5~9초 간격으로 랜덤 이벤트 발생
    intervalId = setInterval(() => {
      const gen = pickRandom(MOCK_EVENT_GENERATORS);
      onMessage(gen());
    }, 5000 + Math.random() * 4000);
  }, 600);

  return {
    close: () => {
      clearTimeout(openTimer);
      if (intervalId) clearInterval(intervalId);
      onClose && onClose();
    },
  };
}

// ──────────────────────────────────────────────────────────
//  Real WebSocket
// ──────────────────────────────────────────────────────────
function createRealSocket({ wsUrl, onOpen, onClose, onMessage }) {
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => onOpen && onOpen();
  ws.onclose = () => onClose && onClose();
  ws.onerror = () => onClose && onClose();
  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage(data);
    } catch (err) {
      console.error('[FriendSocket] parse error', err);
    }
  };

  return {
    close: () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    },
  };
}
