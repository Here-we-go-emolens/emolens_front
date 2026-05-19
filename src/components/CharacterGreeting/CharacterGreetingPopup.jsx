import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import mascotImg from '@/assets/mascot-removebg-preview.png';
import "@/styles/CharacterGreeting/CharacterGreetingPopup.css";

function buildDialogueTree(daysSinceLast) {
  const startText = daysSinceLast >= 3
    ? `${daysSinceLast}일 만이야! 보고 싶었어 😊\n그동안 어떻게 지냈어?`
    : '안녕! 오늘 기분이 어때? 😊';

  return {
  start: {
    text: startText,
    choices: [
      { label: '😊 행복해!',     next: 'happy' },
      { label: '😌 평온해',      next: 'calm' },
      { label: '😢 좀 슬퍼...',  next: 'sad' },
      { label: '😰 좀 불안해',   next: 'anxious' },
      { label: '🤔 잘 모르겠어', next: 'unsure' },
      { label: '🚶 그냥 둘러볼게', action: 'close' },
    ],
  },
  happy: {
    text: '오, 정말? 좋은 날이네 ✨\n이 기분, 일기에 남겨볼래?',
    choices: [
      { label: '✏️ 응, 일기 쓸게', action: 'write', emotion: '행복' },
      { label: '나중에 쓸게', action: 'close' },
    ],
  },
  calm: {
    text: '평온한 하루구나~ 😌\n오늘 있었던 일 조금 기록해볼까?',
    choices: [
      { label: '✏️ 응, 일기 쓸게', action: 'write', emotion: '평온' },
      { label: '나중에 쓸게', action: 'close' },
    ],
  },
  sad: {
    text: '그렇구나... 많이 힘들었어? 😢\n속에 있는 거 일기에 털어놔봐.',
    choices: [
      { label: '✏️ 응, 써볼게', action: 'write', emotion: '슬픔' },
      { label: '🤖 AI랑 얘기할래', action: 'chat' },
      { label: '괜찮아, 둘러볼게', action: 'close' },
    ],
  },
  anxious: {
    text: '불안한 게 있구나 😰\n나한테 얘기해봐, 같이 생각해볼게.',
    choices: [
      { label: '🤖 AI랑 대화할게', action: 'chat' },
      { label: '✏️ 일기 써볼게', action: 'write', emotion: '불안' },
      { label: '괜찮아, 둘러볼게', action: 'close' },
    ],
  },
  unsure: {
    text: '그럴 때 있지~ 😄\n나랑 얘기하다 보면 찾을 수 있을 거야!',
    choices: [
      { label: '🤖 응! 대화하러 갈래', action: 'chat' },
      { label: '아니, 그냥 둘러볼게', action: 'close' },
    ],
  },
  };
}

function buildPostWriteNode(userName, characterTone) {
  const name = userName ?? '';
  const byTone = {
    FRIENDLY_INFORMAL: `일기 잘 썼어! 👏\n일기는 하루에 여러 번 써도 괜찮아. 자주 쓸수록 내가 ${name}의 감정을 더 깊이 이해할 수 있거든.\n한 편 더 써볼래?`,
    WARM_FORMAL:       `일기 잘 쓰셨어요! 👏\n일기는 하루에 여러 번 써도 괜찮아요. 자주 쓸수록 제가 ${name}님의 감정을 더 깊이 이해할 수 있어요.\n한 편 더 써볼까요?`,
    PLAYFUL:           `일기 완성! 🎉 잘했어!\n하루에 여러 번 써도 완전 OK야. 더 쓸수록 나도 더 잘 이해할 수 있거든!\n한 편 더 써볼까?`,
    COOL:              `일기 작성 완료. 👏\n하루 여러 편 작성 가능해요. 데이터가 많을수록 분석 정확도가 높아져요.\n한 편 더 쓰시겠어요?`,
  };
  return {
    text: byTone[characterTone] ?? byTone.WARM_FORMAL,
    choices: [
      { label: '좋아요, 쓸게요', action: 'writeMore' },
      { label: '다음에 쓸게요',  action: 'later' },
    ],
  };
}

const SPEED = 32;

function getChoiceClass(choice) {
  if (choice.action === 'write' || choice.action === 'writeMore') return 'primary';
  if (choice.action === 'chat')                                   return 'chat-primary';
  if (choice.action === 'close' || choice.action === 'later')    return 'muted';
  return '';
}

const CharacterGreetingPopup = ({
  characterName, daysSinceLast = 0, onClose,
  postWriteMode = false, userName, characterTone,
  onWriteMore, onLater,
}) => {
  const navigate = useNavigate();
  const [nodeKey, setNodeKey]         = useState('start');
  const [displayText, setDisplayText] = useState('');
  const [typingDone, setTypingDone]   = useState(false);

  const DIALOGUE_TREE = buildDialogueTree(daysSinceLast);
  const node = postWriteMode ? buildPostWriteNode(userName, characterTone) : DIALOGUE_TREE[nodeKey];

  useEffect(() => {
    setDisplayText('');
    setTypingDone(false);
    let i = 0;
    const full = node.text;
    const timer = setInterval(() => {
      i++;
      setDisplayText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer);
        setTypingDone(true);
      }
    }, SPEED);
    return () => clearInterval(timer);
  }, [nodeKey, node.text]);

  const skipTyping = useCallback(() => {
    if (!typingDone) {
      setDisplayText(node.text);
      setTypingDone(true);
    }
  }, [typingDone, node.text]);

  const handleOverlayClick = () => {
    if (!typingDone) skipTyping();
    else onClose();
  };

  const handleChoice = (choice) => {
    if (choice.next)                   { setNodeKey(choice.next); return; }
    if (choice.action === 'close')     { onClose(); return; }
    if (choice.action === 'write')     { onClose(); navigate(`/write${choice.emotion ? `?emotion=${encodeURIComponent(choice.emotion)}` : ''}`); return; }
    if (choice.action === 'chat')      { onClose(); navigate('/ai-chat'); return; }
    if (choice.action === 'writeMore') { onWriteMore?.(); return; }
    if (choice.action === 'later')     { onLater?.(); }
  };

  return (
    <div className="cg-overlay" onClick={handleOverlayClick}>
      <div className="cg-box" onClick={e => { e.stopPropagation(); skipTyping(); }}>
        <div className="cg-header">
          <img src={mascotImg} alt="" className="cg-mascot" />
          <span className="cg-name-badge">{characterName ?? 'AI 친구'}</span>
          {!typingDone && <span className="cg-skip-hint">화면을 탭하면 건너뜀</span>}
        </div>
        <div className="cg-speech">
          {displayText}
          {!typingDone && <span className="cg-cursor" />}
        </div>
        {typingDone && (
          <div className="cg-choices">
            {node.choices.map((choice, i) => (
              <button
                key={i}
                className={`cg-choice ${getChoiceClass(choice)}`}
                onClick={e => { e.stopPropagation(); handleChoice(choice); }}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterGreetingPopup;
