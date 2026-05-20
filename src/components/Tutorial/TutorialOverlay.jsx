import { useState, useEffect, useLayoutEffect } from 'react';
import mascotImg from '../../assets/mascot-removebg-preview.png';
import './TutorialOverlay.css';

const STEPS = [
  {
    title: '안녕, 나는 EmoLens 친구야!',
    desc: '처음 만났네! 나랑 같이 네 감정을 기록하고\n탐색해볼 거야. 주요 기능을 소개해줄게!',
    targetId: null,
  },
  {
    title: '일기를 써봐!',
    desc: '이 버튼으로 오늘 하루를 기록할 수 있어.\n내가 네 감정을 자동으로 분석해줄게.',
    targetId: 'tut-write',
  },
  {
    title: '나랑 대화하면서 일기 써봐!',
    desc: '나랑 이야기하면서 일기를 쓸 수도 있어.\n네 감정을 더 깊이 탐색해볼 수 있거든.',
    targetId: 'tut-ai-chat',
  },
  {
    title: '주간 리포트도 있어!',
    desc: '매주 네 감정 패턴을 분석해줄게.\n나도 몰랐던 감정 흐름을 함께 발견해봐.',
    targetId: 'tut-weekly',
  },
  {
    title: '감정 통계도 볼 수 있어!',
    desc: '월별 감정 분포와 AI 인사이트로\n네 감정 패턴을 깊이 알아볼 수 있어.',
    targetId: 'tut-stats',
  },
  {
    title: '이제 시작해볼까?',
    desc: '준비 완료! 오늘 첫 번째 일기를 써봐.\n나 여기서 항상 기다리고 있을게!',
    targetId: null,
  },
];

const CARD_W = 300;
const CARD_H = 360;
const GAP    = 16;
const EDGE   = 12;

function computeCardLayout(rect) {
  if (!rect) {
    return {
      style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      arrow: null,
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const clampTop  = (t) => Math.min(Math.max(t, EDGE), vh - CARD_H - EDGE);
  const clampLeft = (l) => Math.min(Math.max(l, EDGE), vw - CARD_W - EDGE);

  const idealTop  = rect.top  + rect.height / 2 - CARD_H / 2;
  const idealLeft = rect.left + rect.width  / 2 - CARD_W / 2;

  if (vw - rect.right >= CARD_W + GAP + EDGE) {
    return { style: { top: `${clampTop(idealTop)}px`, left: `${rect.right + GAP}px` }, arrow: 'left' };
  }
  if (rect.left >= CARD_W + GAP + EDGE) {
    return { style: { top: `${clampTop(idealTop)}px`, left: `${rect.left - CARD_W - GAP}px` }, arrow: 'right' };
  }
  if (vh - rect.bottom >= CARD_H + GAP + EDGE) {
    return { style: { top: `${rect.bottom + GAP}px`, left: `${clampLeft(idealLeft)}px` }, arrow: 'top' };
  }
  if (rect.top >= CARD_H + GAP + EDGE) {
    return { style: { top: `${rect.top - CARD_H - GAP}px`, left: `${clampLeft(idealLeft)}px` }, arrow: 'bottom' };
  }
  return {
    style: { top: `${clampTop(vh / 2 - CARD_H / 2)}px`, left: `${clampLeft(vw / 2 - CARD_W / 2)}px` },
    arrow: null,
  };
}

export default function TutorialOverlay({ userId, onDone }) {
  const [step, setStep]         = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [typedText, setTypedText]   = useState('');
  const [typing, setTyping]         = useState(false);

  const current = STEPS[step];
  const total   = STEPS.length;

  // 타이핑 애니메이션
  useEffect(() => {
    setTypedText('');
    setTyping(true);
    let i = 0;
    const full = current.desc;
    const timer = setInterval(() => {
      i++;
      setTypedText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer);
        setTyping(false);
      }
    }, 22);
    return () => clearInterval(timer);
  }, [step, current.desc]);

  useLayoutEffect(() => {
    if (!current.targetId) { setTargetRect(null); return; }
    const el = document.getElementById(current.targetId);
    setTargetRect(el ? el.getBoundingClientRect() : null);
  }, [step, current.targetId]);

  useEffect(() => {
    const handler = () => {
      if (!current.targetId) return;
      const el = document.getElementById(current.targetId);
      if (el) setTargetRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [current.targetId]);

  const finish = () => {
    if (userId) localStorage.setItem(`emolens_tutorial_done_${userId}`, 'true');
    onDone();
  };

  const next = () => (step < total - 1 ? setStep((s) => s + 1) : finish());
  const prev = () => step > 0 && setStep((s) => s - 1);

  const spotlightStyle = targetRect
    ? { top: targetRect.top - 6, left: targetRect.left - 10, width: targetRect.width + 20, height: targetRect.height + 12 }
    : null;

  const { style: cardStyle, arrow } = computeCardLayout(targetRect);

  return (
    <div className="tut-root">
      {spotlightStyle ? (
        <div className="tut-spotlight" style={spotlightStyle} />
      ) : (
        <div className="tut-backdrop" />
      )}

      <div className="tut-card" key={step} style={cardStyle}>
        {arrow === 'left'   && <div className="tut-arrow-l" />}
        {arrow === 'right'  && <div className="tut-arrow-r" />}
        {arrow === 'top'    && <div className="tut-arrow-t" />}
        {arrow === 'bottom' && <div className="tut-arrow-b" />}

        <div className="tut-mascot-wrap">
          <img src={mascotImg} alt="EmoLens 마스코트" className="tut-mascot" />
        </div>

        <h3 className="tut-title">{current.title}</h3>
        <p className="tut-desc">
          {typedText}
          {typing && <span className="tut-cursor" />}
        </p>

        <div className="tut-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`tut-dot${i === step ? ' active' : i < step ? ' past' : ''}`} />
          ))}
        </div>

        <div className="tut-btns">
          {step > 0 && (
            <button className="tut-btn-prev" onClick={prev}>이전</button>
          )}
          <button className="tut-btn-next" onClick={next}>
            {step === total - 1 ? '시작하기 🚀' : '다음'}
          </button>
        </div>

        <button className="tut-btn-skip" onClick={finish}>건너뛰기</button>
      </div>
    </div>
  );
}
