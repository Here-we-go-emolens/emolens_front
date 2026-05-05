import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAiResponse, finishChat } from '@/api/aiChat';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCharacter } from '@/hooks/useCharacter';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import '@/styles/AiDiary/AiDiaryChatPage.css';

const SUGGESTED_QUESTIONS = [
  '오늘 가장 위로가 되었던 순간은?',
  '내일은 어떤 기분으로 시작하고 싶은가요?',
  '지금 나에게 가장 필요한 것은?',
];

const CATEGORY_PROMPTS = {
  '오늘 가장 힘들었던 순간': '오늘 가장 힘들었던 순간에 대해 이야기하고 싶어. 그때 어떤 감정이었는지 같이 정리할 수 있게 질문해줘.',
  '지금 가장 큰 감정': '지금 내 안에서 가장 크게 느껴지는 감정이 뭔지 잘 모르겠어. 하나씩 풀어볼 수 있게 도와줘.',
  '누군가와 있었던 일': '오늘 누군가와 있었던 일이 계속 마음에 남아. 그 상황과 내 감정을 같이 정리해줘.',
  '내일이 걱정되는 이유': '내일이 걱정돼. 뭐가 불안한지 차근차근 말할 수 있게 질문해줘.',
  '위로가 필요해': '지금은 해결책보다 위로를 먼저 받고 싶어. 오늘 내 마음을 천천히 들어줘.',
  '그냥 털어놓고 싶어': '정리되지 않았지만 그냥 털어놓고 싶어. 편하게 이야기할 수 있게 먼저 말 걸어줘.',
  '왜 그게 마음에 남았을까': '그 일이 왜 이렇게 마음에 남는지 잘 모르겠어. 이유를 같이 짚어볼 수 있게 질문해줘.',
  '그때 진짜 듣고 싶었던 말': '그 순간 내가 진짜 듣고 싶었던 말이 뭐였는지 생각해보고 싶어. 천천히 꺼낼 수 있게 도와줘.',
  '내가 놓친 감정이 있을까': '겉으로는 하나의 감정 같지만 다른 감정도 섞여 있는 것 같아. 내가 놓친 감정이 있는지 같이 살펴봐줘.',
  '관계에서 걸리는 부분': '사람과의 관계에서 걸리는 부분이 있어. 어떤 점이 마음을 불편하게 했는지 정리해보고 싶어.',
  '지금 가장 필요한 위로': '지금 내게 가장 필요한 위로가 뭔지 모르겠어. 내 마음을 먼저 다독여줘.',
  '오늘을 한 문장으로 정리': '오늘 하루를 한 문장으로 정리해보고 싶어. 핵심 감정을 같이 잡아줘.',
  '내일 덜 불안해지려면': '내일을 조금 덜 불안하게 맞이하려면 무엇이 필요할지 같이 정리해줘.',
  '지금 할 수 있는 작은 행동': '지금 당장 부담 없이 할 수 있는 작은 행동이 뭐가 있을지 같이 찾아줘.',
  '오늘 내가 잘 버틴 점': '오늘 내가 그래도 잘 버틴 점이 있다면 무엇인지 같이 찾아보고 싶어.',
};

const CATEGORY_SETS = {
  opening: [
    '오늘 가장 힘들었던 순간',
    '지금 가장 큰 감정',
    '누군가와 있었던 일',
    '내일이 걱정되는 이유',
    '위로가 필요해',
    '그냥 털어놓고 싶어',
  ],
  emotion: [
    '지금 가장 큰 감정',
    '내가 놓친 감정이 있을까',
    '왜 그게 마음에 남았을까',
    '그때 진짜 듣고 싶었던 말',
    '지금 가장 필요한 위로',
  ],
  relationship: [
    '누군가와 있었던 일',
    '관계에서 걸리는 부분',
    '그때 진짜 듣고 싶었던 말',
    '왜 그게 마음에 남았을까',
    '지금 가장 필요한 위로',
  ],
  anxiety: [
    '내일이 걱정되는 이유',
    '지금 가장 큰 감정',
    '왜 그게 마음에 남았을까',
    '내일 덜 불안해지려면',
    '지금 할 수 있는 작은 행동',
  ],
  closing: [
    '오늘을 한 문장으로 정리',
    '오늘 내가 잘 버틴 점',
    '지금 가장 필요한 위로',
    '내일 덜 불안해지려면',
    '지금 할 수 있는 작은 행동',
  ],
};

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

function inferConversationTopic(messages) {
  const userMessages = messages.filter((msg) => msg.role === 'user');
  const aiMessages = messages.filter((msg) => msg.role === 'ai');
  const recentText = userMessages.slice(-2).map((msg) => msg.text).join(' ').toLowerCase();
  const lastAiText = (aiMessages.at(-1)?.text ?? '').toLowerCase();

  if (!recentText.trim() && !lastAiText.trim()) return 'opening';

  const relationshipKeywords = ['친구', '엄마', '아빠', '가족', '선배', '후배', '동료', '사람', '관계', '대화', '말다툼', '연락', '상대'];
  const anxietyKeywords = ['내일', '걱정', '불안', '긴장', '시험', '면접', '발표', '출근', '미래', '실수', '무서'];
  const emotionKeywords = ['슬프', '우울', '눈물', '힘들', '지쳤', '외롭', '답답', '화나', '짜증', '허무', '공허', '속상'];
  const closingKeywords = ['한 문장', '정리', '돌아보', '마무리', '지금 할 수 있는', '작은 행동', '내일', '어떻게 해보면 좋을', '잘 버틴'];

  const containsAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

  if (containsAny(lastAiText, closingKeywords)) return 'closing';
  if (containsAny(lastAiText, anxietyKeywords)) return 'anxiety';
  if (containsAny(lastAiText, relationshipKeywords)) return 'relationship';
  if (containsAny(lastAiText, emotionKeywords)) return 'emotion';

  if (containsAny(recentText, anxietyKeywords)) return 'anxiety';
  if (containsAny(recentText, relationshipKeywords)) return 'relationship';
  if (containsAny(recentText, emotionKeywords)) return 'emotion';

  return 'emotion';
}

function getCategorySet(messages) {
  const userCount = messages.filter((msg) => msg.role === 'user').length;
  if (userCount === 0) return CATEGORY_SETS.opening;
  if (userCount >= 4) return CATEGORY_SETS.closing;

  const topic = inferConversationTopic(messages);
  return CATEGORY_SETS[topic] ?? CATEGORY_SETS.emotion;
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
  const user = useCurrentUser();
  const { character, loading: characterLoading, notFound } = useCharacter();

  const chatLimit = user?.chatLimit ?? 10;
  const [chatAdded, setChatAdded] = useState(0);
  const chatUsed = (user?.chatUsed ?? 0) + chatAdded;

  const [messages,   setMessages]   = useState([
    { id: 1, role: 'ai', text: getCharacterGreeting(null), time: '' },
  ]);
  const [input,      setInput]      = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const [saveState,  setSaveState]  = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [panelKeywords, setPanelKeywords] = useState([]);
  const [panelSummary,  setPanelSummary]  = useState(null);

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

  useEffect(() => {
    if (!character) return;

    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].role !== 'ai') return prev;
      return [{ ...prev[0], text: getCharacterGreeting(character) }];
    });
  }, [character]);

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

    try {
      const aiText = await getAiResponse([...messages, userMsg]);
      const aiMsg = { id: Date.now() + 1, role: 'ai', text: aiText, time: getNow() };
      const updatedMessages = [...messages, userMsg, aiMsg];
      setMessages(updatedMessages);
      setPanelKeywords(extractKeywords(updatedMessages));
      setPanelSummary(buildSummary(updatedMessages));
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

  const handleSuggest = (q) => {
    setInput(q);
    textareaRef.current?.focus();
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 0);
  };

  const handleStarterPick = (category) => {
    const starterPrompt = CATEGORY_PROMPTS[category];
    if (!starterPrompt) return;
    sendMessage(starterPrompt);
  };

  const handleSave = async () => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) {
      alert('먼저 AI와 대화를 나눠주세요.');
      return;
    }
    setSaveState('saving');
    try {
      const diaryId = await finishChat(messages);
      setSaveState('saved');
      setTimeout(() => navigate(`/diary/${diaryId}`), 800);
    } catch {
      alert('일기 생성에 실패했습니다. 다시 시도해주세요.');
      setSaveState('idle');
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

  const activeCategories = getCategorySet(messages);
  const lastAiMessageId = [...messages].reverse().find((msg) => msg.role === 'ai')?.id;

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
                <div className="chat-character-avatar">{character.name[0]}</div>
                <div className="chat-character-meta">
                  <strong>{character.name}</strong>
                  <span>{character.toneDescription} · {character.personalityDescription}</span>
                </div>
              </div>
            )}
          </div>
          <div className="chat-header-right">
            <span className="chat-date">{formatDate(new Date())}</span>
            <span className={`chat-usage-badge ${chatLimit - chatUsed <= 3 ? 'warn' : ''}`}>
              이번 달 {chatUsed}/{chatLimit}회
            </span>
          </div>
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
                    {character?.name?.[0] ?? 'AI'}
                  </div>
                )}
                <div className="msg-group">
                  <div className={`msg-bubble ${msg.role}`}>{msg.text}</div>
                  <span className="msg-time">{msg.time}</span>
                  {msg.role === 'ai' && msg.id === lastAiMessageId && (
                    <div className="starter-chip-wrap">
                      {activeCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className="starter-chip"
                          onClick={() => handleStarterPick(category)}
                        >
                          {category}
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
                <div className="msg-avatar msg-avatar-character">{character?.name?.[0] ?? 'AI'}</div>
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
          onClick={handleSave}
          disabled={saveState === 'saving'}
        >
          {saveState === 'saving' ? '일기 작성 중…' : saveState === 'saved' ? '✓ 저장됨' : '✍️ 대화로 일기 작성'}
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
            {panelSummary ?? <span style={{ color: '#b0a8c8' }}>대화를 나누면 요약이 표시돼요</span>}
          </p>
        </div>

        {/* 추천 주제 */}
        <div className="panel-card">
          <p className="panel-card-title">이야기 주제 제안</p>
          <div className="suggest-list">
            {activeCategories.slice(0, 3).map(category => (
              <button key={category} className="suggest-btn" onClick={() => handleStarterPick(category)}>
                {category}
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
