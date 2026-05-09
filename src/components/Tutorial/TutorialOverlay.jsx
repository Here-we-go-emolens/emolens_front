import { useState, useEffect, useLayoutEffect } from 'react';
import './TutorialOverlay.css';

const STEPS = [
  {
    title: 'EmoLens에 오신 것을 환영해요!',
    desc: 'AI 기반 감정 일기 서비스, EmoLens입니다.\n주요 기능을 간단히 소개해 드릴게요.',
    emoji: '👋',
    targetId: null,
  },
  {
    title: '일기 작성',
    desc: '오늘 하루를 자유롭게 기록하세요.\nAI가 감정을 자동으로 분석해 드립니다.',
    emoji: '✏️',
    targetId: 'tut-write',
  },
  {
    title: '대화형 일기',
    desc: 'AI와 대화하면서 일기를 작성할 수 있어요.\n더 깊이 감정을 탐색해보세요.',
    emoji: '🤖',
    targetId: 'tut-ai-chat',
  },
  {
    title: 'AI 캐릭터',
    desc: '나만의 AI 캐릭터를 설정하세요.\n감정에 맞는 위로와 조언을 건네드려요.',
    emoji: '🪄',
    targetId: 'tut-character',
  },
  {
    title: '주간 감정 리포트',
    desc: '매주 감정 패턴 분석 리포트를 받아보세요.\n나도 몰랐던 감정 흐름을 발견할 수 있어요.',
    emoji: '📋',
    targetId: 'tut-weekly',
  },
  {
    title: '감정 통계',
    desc: '월별 감정 분포와 AI 인사이트로\n감정 패턴을 깊이 분석해보세요.',
    emoji: '📊',
    targetId: 'tut-stats',
  },
  {
    title: '준비 완료!',
    desc: '이제 EmoLens를 사용할 준비가 됐어요.\n오늘 첫 번째 일기를 작성해볼까요?',
    emoji: '🎉',
    targetId: null,
  },
];

const CARD_W = 300;
const CARD_H = 295; // 카드 높이 추정값 (패딩 + 내용)
const GAP   = 16;  // 스포트라이트와 카드 사이 간격
const EDGE  = 12;  // 화면 가장자리 최소 여백

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

  // 타겟 중심에 카드 세로 정렬했을 때의 이상적인 top
  const idealTop  = rect.top  + rect.height / 2 - CARD_H / 2;
  // 타겟 중심에 카드 가로 정렬했을 때의 이상적인 left
  const idealLeft = rect.left + rect.width  / 2 - CARD_W / 2;

  // 1순위: 오른쪽
  if (vw - rect.right >= CARD_W + GAP + EDGE) {
    return {
      style: { top: `${clampTop(idealTop)}px`, left: `${rect.right + GAP}px` },
      arrow: 'left',
    };
  }
  // 2순위: 왼쪽
  if (rect.left >= CARD_W + GAP + EDGE) {
    return {
      style: { top: `${clampTop(idealTop)}px`, left: `${rect.left - CARD_W - GAP}px` },
      arrow: 'right',
    };
  }
  // 3순위: 아래
  if (vh - rect.bottom >= CARD_H + GAP + EDGE) {
    return {
      style: { top: `${rect.bottom + GAP}px`, left: `${clampLeft(idealLeft)}px` },
      arrow: 'top',
    };
  }
  // 4순위: 위
  if (rect.top >= CARD_H + GAP + EDGE) {
    return {
      style: { top: `${rect.top - CARD_H - GAP}px`, left: `${clampLeft(idealLeft)}px` },
      arrow: 'bottom',
    };
  }
  // 폴백: 화면 중앙
  return {
    style: { top: `${clampTop(vh / 2 - CARD_H / 2)}px`, left: `${clampLeft(vw / 2 - CARD_W / 2)}px` },
    arrow: null,
  };
}

export default function TutorialOverlay({ userId, onDone }) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const current = STEPS[step];
  const total = STEPS.length;

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

        <div className="tut-emoji">{current.emoji}</div>
        <h3 className="tut-title">{current.title}</h3>
        <p className="tut-desc">{current.desc}</p>

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
