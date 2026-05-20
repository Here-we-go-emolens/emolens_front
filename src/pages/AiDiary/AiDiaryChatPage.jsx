import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import { getAiResponse, previewChat, finishChat } from '@/api/aiChat';
import { createDiary } from '@/services/diaryApi';
import { useUserContext } from '@/contexts/UserContext';
import { getMe } from '@/services/userApi';
import { useCharacter } from '@/hooks/useCharacter';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import mascotImg from '@/assets/mascot-removebg-preview.png';
import '@/styles/AiDiary/AiDiaryChatPage.css';

const CHAT_DRAFT_KEY = 'emolens_chat_draft';

const PROGRESS_STEPS = ['감정 탐색', '이야기 파악', '분석 준비', '분석 가능'];
const READY_THRESHOLD = 4; // 사용자 메시지 4개 이상이면 분석 준비 완료

function getReadyModalText(character) {
  const byTone = {
    FRIENDLY_INFORMAL: {
      bubble: '이 정도면 딱 좋은 것 같아!',
      title:  '충분히 이야기했어요',
      body:   '네 이야기를 잘 들었어. 지금 일기로 만들어볼까? 더 하고 싶은 말이 있으면 계속 이야기해도 돼.',
    },
    WARM_FORMAL: {
      bubble: '충분한 대화가 이루어졌어요.',
      title:  '일기를 작성할 준비가 됐어요',
      body:   '오늘 하루를 충분히 들었어요. 지금 감정 일기를 만들어드릴 수 있답니다. 더 나누고 싶은 이야기가 있으시면 계속해도 좋아요.',
    },
    PLAYFUL: {
      bubble: '오케이, 이 정도면 완벽해!',
      title:  '일기 만들 준비 됐어요!',
      body:   '이야기를 잘 들었어요. 지금 바로 일기로 만들어볼까요? 아니면 조금 더 신나는 이야기 해볼 수도 있어요!',
    },
    COOL: {
      bubble: '분석 데이터 수집 완료.',
      title:  '분석 준비가 완료됐습니다',
      body:   '충분한 대화 데이터가 수집됐습니다. 일기를 생성하거나 추가 대화를 이어갈 수 있습니다.',
    },
  };
  return byTone[character?.tone] ?? {
    bubble: '충분한 이야기를 나눴어요!',
    title:  '일기로 만들어볼까요?',
    body:   '이제 AI가 오늘의 감정을 담은 일기를 작성할 수 있어요. 더 이야기하거나 지금 저장해보세요.',
  };
}

const SUGGESTIONS = {
  opening: [
    '오늘 좀 지쳐있어요',
    '뭔가 복잡한 하루였어요',
    '기분이 꽤 좋았어요',
    '별 일 없었는데 우울해요',
    '누군가와 있었던 일이 계속 신경 쓰여요',
    '내일이 걱정돼서요',
  ],
  emotion: [
    '슬프고 무기력해요',
    '화가 나면서도 억울해요',
    '불안하고 초조해요',
    '외롭고 허전해요',
    '지쳐서 아무 감정도 없어요',
    '기쁜데 뭔가 찜찜해요',
    '후회스럽고 자책하게 돼요',
    '설레면서도 긴장돼요',
  ],
  cause: [
    '누군가와 갈등이 있었어요',
    '제 실수 때문인 것 같아요',
    '기대했는데 실망했어요',
    '갑자기 너무 많은 일이 몰렸어요',
    '오래된 감정이 다시 올라온 것 같아요',
    '이유를 잘 모르겠어요',
  ],
  relationship: [
    '가까운 사람이라 더 힘들어요',
    '내가 잘못한 건지 헷갈려요',
    '상대방이 이해가 안 돼요',
    '말을 꺼내기가 너무 어려워요',
    '상처받았는데 티내기 싫었어요',
    '그 사람이 보고 싶기도 해요',
  ],
  degree: [
    '일상이 힘들 정도로 심해요',
    '꽤 많이 신경 쓰여요',
    '은근히 계속 걸려요',
    '잠깐이었지만 강하게 느꼈어요',
    '지금은 조금 나아진 것 같아요',
  ],
  action: [
    '아무것도 못 하고 있어요',
    '억지로 참고 넘겼어요',
    '혼자 끙끙 앓았어요',
    '누군가에게 털어놨는데 더 힘들었어요',
    '일에 집중하면서 잊으려 했어요',
    '울었어요',
  ],
  need: [
    '그냥 들어주는 것만으로도 충분해요',
    '왜 이런 감정인지 이해하고 싶어요',
    '어떻게 해야 할지 같이 생각해보고 싶어요',
    '지금 당장은 위로가 필요해요',
    '이 감정을 정리해서 일기로 쓰고 싶어요',
  ],
  reflection: [
    '내가 너무 예민한 걸 수도 있어요',
    '상황이 어쩔 수 없었던 것 같아요',
    '좀 더 일찍 말했어야 했어요',
    '아직도 정리가 안 돼요',
    '화가 나면서도 제 자신이 더 싫어요',
    '지나고 보니 별 일 아닌 것 같기도 해요',
  ],
  future: [
    '일단 오늘은 그냥 쉬고 싶어요',
    '용기 내서 말해봐야 할 것 같아요',
    '조금 거리를 둘 필요가 있는 것 같아요',
    '내일은 좀 나아질 거라 믿고 싶어요',
    '아직 뭘 해야 할지 모르겠어요',
  ],
  yn: [
    '맞아요, 정확히 그래요',
    '비슷한데 조금 달라요',
    '아니에요, 사실 더 복잡해요',
    '잘 모르겠어요',
  ],
  default: [
    '맞아요, 정확히 그래요',
    '조금 더 이야기해볼게요',
    '사실 더 복잡해요',
    '잘 모르겠어요',
  ],
};

function getSuggestions(lastAiText, isFirst) {
  if (isFirst) return SUGGESTIONS.opening;
  if (!lastAiText) return SUGGESTIONS.default;
  const t = lastAiText;
  if (/감정|느낌|기분|무슨 감정|어떤 감정|어떠셨|어떤가요/.test(t)) return SUGGESTIONS.emotion;
  if (/왜|어떤 일|무슨 일|계기|이유|원인|어떻게 된/.test(t)) return SUGGESTIONS.cause;
  if (/누구|상대|그 사람|관계|친구|가족/.test(t)) return SUGGESTIONS.relationship;
  if (/얼마나|정도|심하|많이|강하/.test(t)) return SUGGESTIONS.degree;
  if (/어떻게 하셨|어떻게 했|그때 어떻게|대처|어땠/.test(t)) return SUGGESTIONS.action;
  if (/필요|원하|바라|도움|뭐가 필요/.test(t)) return SUGGESTIONS.need;
  if (/돌아보|생각해보|어떻게 생각|왜 그런|스스로/.test(t)) return SUGGESTIONS.reflection;
  if (/앞으로|다음|내일|이제 어떻게|해볼|해보면/.test(t)) return SUGGESTIONS.future;
  if (/맞나요|그런가요|그렇죠|맞죠|아닌가요/.test(t)) return SUGGESTIONS.yn;
  return SUGGESTIONS.default;
}

const EMOTION_MAP = [
  { words: ['피곤', '피로', '지침'], label: '피곤함' },
  { words: ['불안', '걱정', '두려'], label: '불안감' },
  { words: ['슬프', '우울', '눈물', '속상'], label: '슬픔' },
  { words: ['기쁘', '행복', '좋아', '즐거'], label: '기쁨' },
  { words: ['화나', '짜증', '분노', '억울'], label: '분노' },
  { words: ['설레', '기대', '신나'], label: '설렘' },
  { words: ['외로', '혼자'], label: '외로움' },
  { words: ['부담', '스트레스', '압박'], label: '부담감' },
  { words: ['답답', '막막'], label: '답답함' },
  { words: ['후회', '아쉬', '미안'], label: '후회' },
  { words: ['감사', '고마'], label: '감사함' },
  { words: ['편안', '평온', '안정'], label: '편안함' },
  { words: ['힘들', '고통', '괴로'], label: '힘듦' },
  { words: ['지쳤', '무기력', '의욕'], label: '무기력' },
  { words: ['허무', '공허'], label: '허무함' },
];

function extractKeywords(messages) {
  const text = messages.filter(m => m.role === 'user').map(m => m.text).join(' ');
  if (!text) return [];
  return EMOTION_MAP
    .filter(({ words }) => words.some(w => text.includes(w)))
    .map(e => e.label)
    .slice(0, 4);
}

function buildSummary(messages) {
  const userMsgs = messages.filter(m => m.role === 'user');
  if (userMsgs.length === 0) return null;
  const combined = userMsgs.map(m => m.text).join(' ');
  return combined.length > 80 ? combined.slice(0, 80) + '…' : combined;
}

// ── 유틸 ──────────────────────────────────────────────────
function getNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatDate(d) {
  const DAYS = ['일','월','화','수','목','금','토'];
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일`;
}

function getCharacterGreeting(character) {
  if (!character) {
    return '안녕하세요 😊 오늘 하루는 어떠셨나요? 편하게 이야기해 주세요.';
  }

  const byTone = {
    FRIENDLY_INFORMAL: `안녕, ${character.name}. 오늘 하루는 어땠어? 편하게 말해줘.`,
    WARM_FORMAL: `${character.name}님과 함께 오늘 하루를 차분히 돌아볼게요. 어떤 하루였는지 들려주세요.`,
    PLAYFUL: `안녕, ${character.name} 왔어. 오늘 있었던 일들 하나씩 가볍게 풀어보자.`,
    COOL: `오늘 하루를 정리해보겠습니다. ${character.name}의 시선으로 차분히 이야기해 주세요.`,
  };

  return byTone[character.tone] ?? '오늘 있었던 일을 편하게 이야기해 주세요.';
}

function getActiveSuggestions(messages) {
  const aiMessages = messages.filter((msg) => msg.role === 'ai');
  const lastAiText = aiMessages.at(-1)?.text ?? '';
  const isFirst = messages.filter((msg) => msg.role === 'user').length === 0;
  return getSuggestions(lastAiText, isFirst);
}

function MicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

// ── 컴포넌트 ──────────────────────────────────────────────
export default function AiDiaryChatPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, setUser } = useUserContext();
  const { character, loading: characterLoading, notFound } = useCharacter();

  const isPremium = user?.plan === 'PREMIUM';
  const chatLimit = isPremium ? Infinity : (user?.chatLimit ?? 10);
  const [chatAdded, setChatAdded] = useState(0);
  const chatUsed = user?.chatUsed ?? 0;

  const [messages,   setMessages]   = useState([
    { id: 1, role: 'ai', text: getCharacterGreeting(null), time: '' },
  ]);
  const [input,      setInput]      = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const [saveState,  setSaveState]  = useState('idle'); // 'idle' | 'previewing' | 'saved'
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTitle,   setPreviewTitle]   = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [confirmSaving,  setConfirmSaving]  = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [panelKeywords, setPanelKeywords] = useState([]);
  const [panelSummary,  setPanelSummary]  = useState(null);
  const [draftData,      setDraftData]      = useState(null);
  const [draftChecked,   setDraftChecked]   = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showReadyModal, setShowReadyModal] = useState(false);
  const readyModalShownRef = useRef(false);

  const bottomRef  = useRef(null);
  const textareaRef = useRef(null);
  const { isSupported: micSupported, isRecording, interimText, toggle: toggleMic } =
    useSpeechRecognition({
      onFinalResult: (text) => {
        setInput((prev) => {
          const next = `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}${text}`.trimStart();
          return next;
        });

        if (textareaRef.current) {
          const nextValue = `${textareaRef.current.value}${textareaRef.current.value && !textareaRef.current.value.endsWith(' ') ? ' ' : ''}${text}`.trimStart();
          textareaRef.current.value = nextValue;
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      },
    });

  useEffect(() => {
    if (!characterLoading && notFound) {
      navigate('/character?next=/ai-chat', { replace: true });
    }
  }, [characterLoading, navigate, notFound]);

  // 페이지 진입 시 최신 chatUsed 동기화
  useEffect(() => {
    getMe().then(setUser).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!character) return;

    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].role !== 'ai') return prev;
      return [{ ...prev[0], text: getCharacterGreeting(character) }];
    });
  }, [character]);

  // 임시저장 초기 확인
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        const hasUserMsg = draft.messages?.some(m => m.role === 'user');
        if (hasUserMsg) {
          setDraftData(draft);
          setShowDraftModal(true);
        } else {
          localStorage.removeItem(CHAT_DRAFT_KEY);
        }
      }
    } catch {
      localStorage.removeItem(CHAT_DRAFT_KEY);
    }
    setDraftChecked(true);
  }, []);

  // 자동 임시저장
  useEffect(() => {
    if (!draftChecked) return;
    const hasUserMsg = messages.some(m => m.role === 'user');
    if (!hasUserMsg) return;
    localStorage.setItem(CHAT_DRAFT_KEY, JSON.stringify({ messages, savedAt: new Date().toISOString() }));
  }, [messages, draftChecked]);

  // 분석 준비 완료 모달 트리거
  useEffect(() => {
    if (readyModalShownRef.current || isTyping) return;
    const userMsgCount = messages.filter(m => m.role === 'user').length;
    if (userMsgCount >= READY_THRESHOLD) {
      setShowReadyModal(true);
      readyModalShownRef.current = true;
    }
  }, [messages, isTyping]);

  // 새 메시지마다 하단 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // textarea 자동 높이
  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const sendMessage = async (forcedText) => {
    const text = (forcedText ?? input).trim();
    if (!text || isTyping) return;

    // 사용량 한도 체크
    if (chatUsed >= chatLimit) {
      setShowLimitModal(true);
      return;
    }

    const userMsg = { id: Date.now(), role: 'user', text, time: getNow() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);
    setChatAdded(prev => prev + 1);
    setUser(prev => prev ? { ...prev, chatUsed: (prev.chatUsed ?? 0) + 1 } : prev);

    try {
      const aiText = await getAiResponse([...messages, userMsg]);
      const aiMsg = { id: Date.now() + 1, role: 'ai', text: aiText, time: getNow() };
      setMessages(prev => {
        const updated = [...prev, aiMsg];
        setPanelKeywords(extractKeywords(updated));
        setPanelSummary(buildSummary(updated));
        return updated;
      });
    } catch {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: '잠시 후 다시 시도해 주세요.', time: getNow() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionPick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleRestoreDraft = () => {
    if (!draftData) return;
    setMessages(draftData.messages);
    setPanelKeywords(extractKeywords(draftData.messages));
    setPanelSummary(buildSummary(draftData.messages));
    setShowDraftModal(false);
    setDraftData(null);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(CHAT_DRAFT_KEY);
    setShowDraftModal(false);
    setDraftData(null);
  };

  const handleGeneratePreview = async () => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) {
      showToast('먼저 AI와 대화를 나눠주세요.', 'warning');
      return;
    }
    setSaveState('previewing');
    try {
      const { title, content } = await previewChat(messages);
      setPreviewTitle(title);
      setPreviewContent(content);
      setShowPreviewModal(true);
    } catch {
      showToast('일기 미리보기 생성에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setSaveState('idle');
    }
  };

  const handleConfirmSave = async () => {
    setConfirmSaving(true);
    try {
      const today = new Date();
      const diaryDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const diaryId = await createDiary({
        title: previewTitle,
        content: previewContent,
        diaryDate,
        weather: null,
        templateType: null,
        isSecret: false,
        imageUrls: [],
        userEmotions: [],
      });
      localStorage.removeItem(CHAT_DRAFT_KEY);
      setShowPreviewModal(false);
      setSaveState('saved');
      setTimeout(() => navigate(`/diary/${diaryId}`), 800);
    } catch {
      showToast('일기 저장에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setConfirmSaving(false);
    }
  };

  const renderMicButton = () => {
    if (!micSupported) {
      return (
        <button
          className="chat-mic-btn"
          disabled
          title="이 브라우저는 음성 입력을 지원하지 않습니다 (Chrome 권장)"
        >
          <MicIcon />
          음성 입력
        </button>
      );
    }

    return (
      <button
        type="button"
        className={`chat-mic-btn${isRecording ? ' recording' : ''}`}
        onClick={toggleMic}
      >
        <MicIcon />
        {isRecording ? '녹음 중지' : '음성 입력'}
      </button>
    );
  };

  const activeSuggestions = !isTyping ? getActiveSuggestions(messages) : [];
  const lastAiMessageId = [...messages].reverse().find((msg) => msg.role === 'ai')?.id;
  const userMsgCount = messages.filter(m => m.role === 'user').length;
  const progressStep = Math.min(userMsgCount, PROGRESS_STEPS.length);

  return (
    <div className="ai-layout">
      <SidebarLeft />

      {/* ── 가운데 채팅 영역 ──────────────────── */}
      <main className="ai-chat-main">

        {/* 채팅 헤더 */}
        <div className="chat-header">
          <div>
            <h2 className="chat-title">인공지능 대화형 일기</h2>
            <p className="chat-subtitle">
              {character
                ? `${character.name}와 대화하며 오늘의 감정을 정리해보세요`
                : 'AI와 대화하며 오늘의 감정을 정리해보세요'}
            </p>
            {character && (
              <div className="chat-character-row">
                <div className="chat-character-avatar">
                  <img src={mascotImg} alt={character.name} />
                </div>
                <div className="chat-character-meta">
                  <strong>{character.name}</strong>
                  <span>{character.toneDescription} · {character.personalityDescription}</span>
                </div>
              </div>
            )}
          </div>
          <div className="chat-header-right">
            <span className="chat-date">{formatDate(new Date())}</span>
            <span className="chat-usage-badge">
              {isPremium ? '무제한 이용 중 ✨' : `이번 달 ${chatUsed}/${chatLimit}회`}
            </span>
          </div>
        </div>

        {/* 진행도 표시 */}
        <div className="chat-progress-wrap">
          <div className="chat-progress-steps">
            {PROGRESS_STEPS.map((label, i) => {
              const done    = progressStep > i;
              const current = progressStep === i && i < PROGRESS_STEPS.length;
              const isLast  = i === PROGRESS_STEPS.length - 1;
              return (
                <div key={label} className="cp-step-item">
                  <div className={`cp-node ${done ? 'done' : current ? 'current' : ''} ${isLast && done ? 'ready' : ''}`}>
                    {done ? <span className="cp-check">✓</span> : <span className="cp-num">{i + 1}</span>}
                  </div>
                  <span className={`cp-label ${done ? 'done' : current ? 'current' : ''}`}>{label}</span>
                  {!isLast && <div className={`cp-line ${progressStep > i ? 'filled' : ''}`} />}
                </div>
              );
            })}
          </div>
          {progressStep >= PROGRESS_STEPS.length && (
            <button className="cp-ready-btn" onClick={() => setShowReadyModal(true)}>
              일기 만들기
            </button>
          )}
        </div>

        {/* 소프트 배너: 잔여 3회 이하 */}
        {chatLimit - chatUsed <= 3 && chatLimit - chatUsed > 0 && (
          <div className="chat-soft-banner">
            <span>이번 달 대화를 거의 다 사용했어요 🌿 남은 횟수: {chatLimit - chatUsed}회</span>
            <button className="chat-banner-cta" onClick={() => navigate('/premium')}>
              무제한으로 대화하기
            </button>
          </div>
        )}

        {/* 메시지 목록 */}
        <div className="chat-messages">
          <div className="chat-messages-inner">

            {/* 날짜 구분선 */}
            <div className="date-divider">
              <span>{formatDate(new Date())}</span>
            </div>

            {messages.map(msg => (
              <div key={msg.id} className={`msg-row ${msg.role}`}>
                {msg.role === 'ai' && (
                  <div className="msg-avatar msg-avatar-character">
                    <img src={mascotImg} alt={character?.name ?? 'AI'} />
                  </div>
                )}
                <div className="msg-group">
                  <div className={`msg-bubble ${msg.role}`}>{msg.text}</div>
                  <span className="msg-time">{msg.time}</span>
                  {msg.role === 'ai' && msg.id === lastAiMessageId && activeSuggestions.length > 0 && (
                    <div className="starter-chip-wrap">
                      {activeSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="starter-chip"
                          onClick={() => handleSuggestionPick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {isTyping && (
              <div className="msg-row ai">
                <div className="msg-avatar msg-avatar-character">
                <img src={mascotImg} alt={character?.name ?? 'AI'} />
              </div>
                <div className="msg-group">
                  <div className="msg-bubble ai typing-bubble">
                    <span className="dot" /><span className="dot" /><span className="dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="chat-input-area">
          {chatUsed >= chatLimit ? (
            <div className="chat-limit-reached">
              <span className="chat-limit-icon">💙</span>
              <p className="chat-limit-msg">이번 달 대화를 모두 사용했어요.<br />Premium으로 계속 대화할 수 있어요.</p>
              <button className="chat-limit-cta" onClick={() => navigate('/premium')}>
                Premium으로 계속 대화하기
              </button>
              <button className="chat-limit-later" onClick={() => {}}>
                다음 달까지 기다릴게요
              </button>
            </div>
          ) : (
            <div className="chat-input-stack">
              <div className="chat-input-box">
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  placeholder="오늘 있었던 일을 편하게 입력해보세요 (Enter 전송, Shift+Enter 줄바꿈)"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                {renderMicButton()}
                <button
                  className={`chat-send ${input.trim() && !isTyping ? 'active' : ''}`}
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                >
                  ↑
                </button>
              </div>
              {interimText && <p className="chat-interim">{interimText}</p>}
            </div>
          )}
        </div>

        {/* 분석 준비 완료 모달 */}
        {showReadyModal && (() => {
          const { bubble, title, body } = getReadyModalText(character);
          return (
            <div className="cr-overlay" onClick={() => setShowReadyModal(false)}>
              <div className="cr-modal" onClick={e => e.stopPropagation()}>
                <div className="cr-top">
                  <div className="cr-avatar-wrap">
                    <img src={mascotImg} alt={character?.name ?? 'AI'} className="cr-avatar" />
                    <div className="cr-badge">✦</div>
                  </div>
                  <div className="cr-bubble">{bubble}</div>
                </div>
                <div className="cr-body">
                  <div className="cr-progress-dots">
                    {PROGRESS_STEPS.map((_, i) => (
                      <div key={i} className="cr-dot filled" />
                    ))}
                  </div>
                  <h3 className="cr-title">{title}</h3>
                  <p className="cr-desc">{body}</p>
                  <div className="cr-btns">
                    <button className="cr-btn-primary" onClick={() => { setShowReadyModal(false); handleGeneratePreview(); }}>
                      일기로 저장하기
                    </button>
                    <button className="cr-btn-secondary" onClick={() => setShowReadyModal(false)}>
                      계속 이야기하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 임시저장 복원 모달 */}
        {showDraftModal && draftData && (() => {
          const userMsgCount = draftData.messages.filter(m => m.role === 'user').length;
          const lastUserMsg = [...draftData.messages].reverse().find(m => m.role === 'user');
          const preview = lastUserMsg?.text?.slice(0, 40) + (lastUserMsg?.text?.length > 40 ? '…' : '');
          const savedDate = draftData.savedAt ? new Date(draftData.savedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
          return (
            <div className="cd-draft-overlay">
              <div className="cd-draft-modal">
                <div className="cd-draft-mascot-wrap">
                  <img src={mascotImg} alt="EmoLens" className="cd-draft-mascot" />
                  <div className="cd-draft-bubble">아직 나눈 이야기가<br />남아있어요 💬</div>
                </div>
                <div className="cd-draft-body">
                  <h3 className="cd-draft-title">이어서 대화할까요?</h3>
                  <p className="cd-draft-preview">"{preview}"</p>
                  <p className="cd-draft-desc">{savedDate} · {userMsgCount}번 답변한 대화예요</p>
                  <div className="cd-draft-btns">
                    <button className="cd-draft-restore" onClick={handleRestoreDraft}>이어서 대화하기</button>
                    <button className="cd-draft-discard" onClick={handleDiscardDraft}>새로 시작하기</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 일기 미리보기 모달 */}
        {showPreviewModal && (
          <div className="pv-overlay" onClick={() => !confirmSaving && setShowPreviewModal(false)}>
            <div className="pv-modal" onClick={e => e.stopPropagation()}>

              {/* 상단 배너 */}
              <div className="pv-banner">
                {!confirmSaving && (
                  <button className="pv-close" onClick={() => setShowPreviewModal(false)}>✕</button>
                )}
                <img src={mascotImg} alt="AI" className="pv-banner-avatar" />
                <div className="pv-banner-text">
                  <p className="pv-banner-title">오늘의 일기가 완성됐어요</p>
                  <p className="pv-banner-sub">수정하고 싶은 부분이 있으면 바로 고쳐보세요</p>
                </div>
                <div className="pv-banner-date">{formatDate(new Date())}</div>
              </div>

              {/* 일기지 본문 */}
              <div className="pv-body">
                <div className="pv-diary-card">
                  <input
                    className="pv-title-input"
                    value={previewTitle}
                    onChange={e => setPreviewTitle(e.target.value)}
                    maxLength={100}
                    placeholder="제목을 입력하세요"
                    disabled={confirmSaving}
                  />
                  <div className="pv-divider" />
                  <textarea
                    className="pv-content-textarea"
                    value={previewContent}
                    onChange={e => setPreviewContent(e.target.value)}
                    placeholder="내용을 입력하세요"
                    disabled={confirmSaving}
                  />
                </div>
              </div>

              {/* 하단 버튼 */}
              <div className="pv-footer">
                <button className="pv-btn-cancel" onClick={() => setShowPreviewModal(false)} disabled={confirmSaving}>
                  다시 생성하기
                </button>
                <button
                  className="pv-btn-confirm"
                  onClick={handleConfirmSave}
                  disabled={confirmSaving || !previewTitle.trim() || !previewContent.trim()}
                >
                  {confirmSaving ? '저장 중…' : '저장하기'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 한도 초과 모달 */}
        {showLimitModal && (
          <div className="chat-modal-overlay" onClick={() => setShowLimitModal(false)}>
            <div className="chat-modal-box" onClick={e => e.stopPropagation()}>
              <div className="chat-modal-emoji">💙</div>
              <h3 className="chat-modal-title">오늘도 이야기 나눠줘서 고마워요</h3>
              <p className="chat-modal-desc">
                이번 달 대화 횟수를 모두 사용했어요.<br />
                충분히 이야기했으니, 오늘은 여기서 쉬어가도 좋아요.
              </p>
              <button className="chat-modal-primary" onClick={() => navigate('/premium')}>
                Premium으로 계속 대화하기
              </button>
              <button className="chat-modal-secondary" onClick={() => setShowLimitModal(false)}>
                다음 달까지 기다릴게요
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── 오른쪽 요약 패널 ──────────────────── */}
      <aside className="ai-panel">

        {/* 저장 버튼 */}
        <button
          className={`save-btn ${saveState === 'saved' ? 'saved' : ''}`}
          onClick={handleGeneratePreview}
          disabled={saveState === 'previewing'}
        >
          {saveState === 'previewing' ? '미리보기 생성 중…' : saveState === 'saved' ? '✓ 저장됨' : '✍️ 대화로 일기 작성'}
        </button>
        {saveState === 'saved' && (
          <div className="save-toast">일기가 생성됐어요! 이동 중...</div>
        )}

        {/* 감정 키워드 */}
        <div className="panel-card">
          <p className="panel-card-title">오늘의 감정 키워드</p>
          <div className="kw-row">
            {panelKeywords.length > 0
              ? panelKeywords.map(k => <span key={k} className="kw-chip">{k}</span>)
              : <span style={{ fontSize: '12px', color: '#b0a8c8' }}>대화를 나누면 감정 키워드가 나타나요</span>
            }
          </div>
        </div>

        {/* 대화 요약 */}
        <div className="panel-card">
          <p className="panel-card-title">대화 요약</p>
          <p className="panel-card-body">
            {panelSummary ?? <span style={{ color: 'var(--text-muted)' }}>대화를 나누면 요약이 표시돼요</span>}
          </p>
        </div>

        {/* 답변 추천 */}
        <div className="panel-card">
          <p className="panel-card-title">답변 추천</p>
          <div className="suggest-list">
            {activeSuggestions.slice(0, 4).map(suggestion => (
              <button key={suggestion} className="suggest-btn" onClick={() => handleSuggestionPick(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* 대화 진행 현황 */}
        <div className="panel-card">
          <p className="panel-card-title">오늘의 기록</p>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-num">{messages.filter(m => m.role === 'user').length}</span>
              <span className="stat-label">내 답변</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{messages.filter(m => m.role === 'ai').length}</span>
              <span className="stat-label">AI 질문</span>
            </div>
          </div>
        </div>

      </aside>
    </div>
  );
}
