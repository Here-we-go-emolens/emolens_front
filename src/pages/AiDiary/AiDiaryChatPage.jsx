import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAiResponse } from '@/api/aiChat';
import '@/styles/AiDiary/AiDiaryChatPage.css';

// ── 상수 ──────────────────────────────────────────────────
const CHAT_LIMIT = 10; // 무료 월 한도
const CHAT_USED_INIT = 7; // 초기 사용량 (실제로는 API에서 가져옴)

const MENU_ITEMS = [
  { label: '홈',         icon: '🏠', route: '/home'    },
  { label: '일반 일기',   icon: '📝', route: '/write'   },
  { label: '대화형 일기', icon: '🤖', route: '/ai-chat' },
  { label: '통계',       icon: '📊', route: '/stats'   },
  { label: '설정',       icon: '⚙️', route: null        },
];

const INITIAL_MESSAGES = [
  { id: 1, role: 'ai',   text: '안녕하세요 😊 오늘 하루는 어떠셨나요? 편하게 이야기해 주세요.',       time: '14:20' },
  { id: 2, role: 'user', text: '생각보다 조금 지쳤어요.',                                        time: '14:21' },
  { id: 3, role: 'ai',   text: '그렇군요. 가장 피곤했던 순간은 언제였나요?',                       time: '14:21' },
  { id: 4, role: 'user', text: '수업이 끝나고 나서 해야 할 일이 많다고 느꼈을 때요.',               time: '14:22' },
  { id: 5, role: 'ai',   text: '그 순간에 어떤 감정이 가장 크게 느껴졌나요?',                      time: '14:22' },
  { id: 6, role: 'user', text: '부담감이 컸고, 조금 답답했어요.',                                 time: '14:23' },
];

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

// ── 컴포넌트 ──────────────────────────────────────────────
export default function AiDiaryChatPage() {
  const navigate        = useNavigate();
  const { pathname }    = useLocation();
  const isActive = (route) => route && pathname.startsWith(route);

  const [messages,   setMessages]   = useState(INITIAL_MESSAGES);
  const [input,      setInput]      = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const [saveState,  setSaveState]  = useState('idle'); // 'idle' | 'saved'
  const [chatUsed,   setChatUsed]   = useState(CHAT_USED_INIT);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const bottomRef  = useRef(null);
  const textareaRef = useRef(null);

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
    if (chatUsed >= CHAT_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    const userMsg = { id: Date.now(), role: 'user', text, time: getNow() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);
    setChatUsed(prev => prev + 1);

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
    if (e.key === 'Enter' && !e.shiftKey) {
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

  const handleSave = () => {
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 3000);
  };

  return (
    <div className="ai-layout">

      {/* ── 왼쪽 사이드바 ─────────────────────── */}
      <aside className="ai-sidebar">
        <div className="ai-profile">
          <div className="ai-profile-img">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="profile" />
          </div>
          <div className="ai-profile-name">달빛소녀</div>
          <div className="ai-profile-tag">#1234</div>
        </div>
        <nav className="ai-nav">
          {MENU_ITEMS.map(item => (
            <button
              key={item.label}
              className={`ai-nav-item ${isActive(item.route) ? 'active' : ''}`}
              onClick={() => item.route && navigate(item.route)}
            >
              <span className="ai-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── 가운데 채팅 영역 ──────────────────── */}
      <main className="ai-chat-main">

        {/* 채팅 헤더 */}
        <div className="chat-header">
          <div>
            <h2 className="chat-title">인공지능 대화형 일기</h2>
            <p className="chat-subtitle">AI와 대화하며 오늘의 감정을 정리해보세요</p>
          </div>
          <div className="chat-header-right">
            <span className="chat-date">{formatDate(new Date())}</span>
            <span className={`chat-usage-badge ${CHAT_LIMIT - chatUsed <= 3 ? 'warn' : ''}`}>
              이번 달 {chatUsed}/{CHAT_LIMIT}회
            </span>
          </div>
        </div>

        {/* 소프트 배너: 잔여 3회 이하 */}
        {CHAT_LIMIT - chatUsed <= 3 && CHAT_LIMIT - chatUsed > 0 && (
          <div className="chat-soft-banner">
            <span>이번 달 대화를 거의 다 사용했어요 🌿 남은 횟수: {CHAT_LIMIT - chatUsed}회</span>
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
                {msg.role === 'ai' && <div className="msg-avatar">🤖</div>}
                <div className="msg-group">
                  <div className={`msg-bubble ${msg.role}`}>{msg.text}</div>
                  <span className="msg-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {isTyping && (
              <div className="msg-row ai">
                <div className="msg-avatar">🤖</div>
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
          {chatUsed >= CHAT_LIMIT ? (
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
              <button
                className={`chat-send ${input.trim() && !isTyping ? 'active' : ''}`}
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
              >
                ↑
              </button>
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
        >
          {saveState === 'saved' ? '✓ 저장됨' : '💾 일기 저장'}
        </button>
        {saveState === 'saved' && (
          <div className="save-toast">대화형 일기가 임시 저장되었습니다.</div>
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
