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

const KEYWORDS = ['피곤함', '부담감', '답답함'];

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

  const sendMessage = async () => {
    const text = input.trim();
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
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: aiText, time: getNow() },
      ]);
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
            {KEYWORDS.map(k => (
              <span key={k} className="kw-chip">{k}</span>
            ))}
          </div>
        </div>

        {/* 대화 요약 */}
        <div className="panel-card">
          <p className="panel-card-title">대화 요약</p>
          <p className="panel-card-body">
            오늘은 해야 할 일이 많아 부담을 느꼈고, 피로가 쌓여 있었음.
          </p>
        </div>

        {/* 추천 질문 */}
        <div className="panel-card">
          <p className="panel-card-title">추천 질문</p>
          <div className="suggest-list">
            {SUGGESTED_QUESTIONS.map(q => (
              <button key={q} className="suggest-btn" onClick={() => handleSuggest(q)}>
                {q}
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
