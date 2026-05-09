import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import { useCharacter } from '@/hooks/useCharacter';
import mascotImg from '@/assets/mascot-removebg-preview.png';
import '@/styles/Character/CharacterSetupPage.css';

const FORMALITY_OPTIONS = [
  { value: 'INFORMAL', label: '반말로 편하게',     emoji: '😊', sample: '"오늘 어땠어?"',    tone: 'FRIENDLY_INFORMAL' },
  { value: 'FORMAL',   label: '존댓말로 정중하게', emoji: '🤝', sample: '"오늘 어떠셨어요?"', tone: 'WARM_FORMAL' },
];

const PERSONALITY_OPTIONS = [
  { value: 'EMPATHETIC',    label: '공감형', emoji: '🤗', desc: '감정을 충분히 받아주고 위로해줘요' },
  { value: 'POSITIVE',      label: '긍정형', emoji: '☀️', desc: '밝고 희망적인 시각으로 응원해줘요' },
  { value: 'DIRECT',        label: '직설형', emoji: '✂️', desc: '핵심을 짚고 분명하게 말해줘요' },
  { value: 'PHILOSOPHICAL', label: '철학형', emoji: '🔮', desc: '깊이 있는 통찰로 함께 생각해줘요' },
];

const SAMPLE_BY_COMBO = {
  'INFORMAL-EMPATHETIC':    '오늘 힘든 일이 있었구나. 그 감정 다 말해도 괜찮아.',
  'INFORMAL-POSITIVE':      '오늘도 고생 많았어! 힘든 것도 있었겠지만 분명 잘한 것도 있을 거야.',
  'INFORMAL-DIRECT':        '뭐가 제일 크게 마음 눌렀어? 핵심부터 얘기해봐.',
  'INFORMAL-PHILOSOPHICAL': '오늘 이 감정이 느껴진 건, 네가 뭘 중요하게 여기는지 보여주는 거야.',
  'FORMAL-EMPATHETIC':      '오늘 많이 지치셨겠어요. 충분히 표현해도 괜찮아요.',
  'FORMAL-POSITIVE':        '오늘 힘드셨더라도, 분명 잘하신 부분이 있었을 거예요.',
  'FORMAL-DIRECT':          '오늘 가장 마음에 걸리는 부분이 뭔지 먼저 짚어볼까요?',
  'FORMAL-PHILOSOPHICAL':   '오늘의 감정은 당신이 소중히 여기는 것을 보여주는 신호일 수 있어요.',
};

const PROGRESS_LABELS = ['이름 짓기', '말투 선택', '성격 선택', '완성'];

function getMascotLine(step, name, formality) {
  if (step === 0) return '안녕! 나는 네 감정 일기를\n함께할 친구야.\n나를 뭐라고 불러줄 거야?';
  if (step === 1) return `"${name}" 마음에 들어!\n나 어떤 말투로 얘기하면 좋을까?`;
  if (step === 2) {
    return formality === 'INFORMAL'
      ? '편한 반말로 얘기할게!\n그럼 내 성격은 어떻게 할까?'
      : '정중한 존댓말로 얘기할게요!\n그럼 제 성격은 어떻게 할까요?';
  }
  return `짜잔! 이게 바로 나야, ${name}!\n앞으로 잘 부탁해 :)`;
}

export default function CharacterSetupPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const nextPath  = new URLSearchParams(location.search).get('next') || '/home';
  const { character, loading, saveCharacter } = useCharacter();

  const [name,        setName]        = useState('');
  const [formality,   setFormality]   = useState('INFORMAL');
  const [personality, setPersonality] = useState('EMPATHETIC');
  const [step,        setStep]        = useState(0);
  const [mode,        setMode]        = useState('create');
  const [submitting,  setSubmitting]  = useState(false);
  const [toast,       setToast]       = useState(null);
  const [animating,   setAnimating]   = useState(false);

  useEffect(() => {
    if (loading || !character) return;
    setName(character.name ?? '');
    setFormality(['FRIENDLY_INFORMAL', 'PLAYFUL'].includes(character.tone) ? 'INFORMAL' : 'FORMAL');
    setPersonality(character.personality ?? 'EMPATHETIC');
    setMode('edit');
  }, [character, loading]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const transition = (next) => {
    setAnimating(true);
    setTimeout(() => { setStep(next); setAnimating(false); }, 200);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await saveCharacter({
        name:         name.trim(),
        tone:         formality === 'INFORMAL' ? 'FRIENDLY_INFORMAL' : 'WARM_FORMAL',
        personality,
        musicGenre:   character?.musicGenre   ?? 'ANY',
        activityType: character?.activityType ?? 'ANY',
      }, mode);
      setToast({ type: 'success', message: mode === 'edit' ? '캐릭터 설정을 저장했습니다.' : '캐릭터가 탄생했어요!' });
      setTimeout(() => navigate(nextPath), 900);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || '저장에 실패했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFormality   = FORMALITY_OPTIONS.find(f => f.value === formality);
  const selectedPersonality = PERSONALITY_OPTIONS.find(p => p.value === personality);
  const sampleDialogue      = SAMPLE_BY_COMBO[`${formality}-${personality}`] ?? '';
  const mascotLine          = getMascotLine(step, name, formality);

  if (loading) return (
    <div className="cq-layout">
      <SidebarLeft />
      <main className="cq-main"><p className="cq-loading">불러오는 중…</p></main>
    </div>
  );

  return (
    <div className="cq-layout">
      <SidebarLeft />

      <main className="cq-main">
        {toast && <div className={`character-toast ${toast.type}`}>{toast.message}</div>}

        {/* 진행 표시 */}
        <div className="cq-progress">
          {PROGRESS_LABELS.map((label, i) => (
            <div key={i} className={`cq-prog-item ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
              <div className="cq-prog-dot">{i < step ? '✓' : i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* 마스코트 + 말풍선 */}
        <div className="cq-mascot-area">
          <div className="cq-speech" key={step}>{mascotLine}</div>
          <img src={mascotImg} alt="" className="cq-mascot" />
        </div>

        {/* 스텝 콘텐츠 */}
        <div className={`cq-step-wrap ${animating ? 'cq-fade-out' : 'cq-fade-in'}`}>

          {/* STEP 0 — 이름 */}
          {step === 0 && (
            <div className="cq-step">
              <input
                className="cq-name-input"
                type="text"
                maxLength={20}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 루미, 모카, 하루"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && name.trim() && transition(1)}
              />
              <button className="cq-btn-primary" onClick={() => transition(1)} disabled={!name.trim()}>
                다음 →
              </button>
            </div>
          )}

          {/* STEP 1 — 반말/존댓말 */}
          {step === 1 && (
            <div className="cq-step">
              <div className="cq-formality-grid">
                {FORMALITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`cq-formality-card ${formality === opt.value ? 'active' : ''}`}
                    onClick={() => setFormality(opt.value)}
                  >
                    <span className="cq-formality-emoji">{opt.emoji}</span>
                    <strong>{opt.label}</strong>
                    <span className="cq-formality-sample">{opt.sample}</span>
                  </button>
                ))}
              </div>
              <div className="cq-btn-row">
                <button className="cq-btn-secondary" onClick={() => transition(0)}>← 이전</button>
                <button className="cq-btn-primary"   onClick={() => transition(2)}>다음 →</button>
              </div>
            </div>
          )}

          {/* STEP 2 — 성격 */}
          {step === 2 && (
            <div className="cq-step">
              <div className="cq-tone-grid">
                {PERSONALITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`cq-tone-card ${personality === opt.value ? 'active' : ''}`}
                    onClick={() => setPersonality(opt.value)}
                  >
                    <span className="cq-tone-emoji">{opt.emoji}</span>
                    <strong>{opt.label}</strong>
                    <span className="cq-tone-sample">{opt.desc}</span>
                  </button>
                ))}
              </div>
              <div className="cq-btn-row">
                <button className="cq-btn-secondary" onClick={() => transition(1)}>← 이전</button>
                <button className="cq-btn-primary"   onClick={() => transition(3)}>다음 →</button>
              </div>
            </div>
          )}

          {/* STEP 3 — 미리보기 */}
          {step === 3 && (
            <div className="cq-step">
              <div className="cq-preview-card">
                <div className="cq-preview-name">{name}</div>
                <div className="cq-preview-badges">
                  <span className="cq-preview-badge">{selectedFormality?.emoji} {selectedFormality?.label}</span>
                  <span className="cq-preview-badge">{selectedPersonality?.emoji} {selectedPersonality?.label}</span>
                </div>
                <div className="cq-preview-dialogue">
                  <span className="cq-preview-dialogue-label">{name}이(가) 이렇게 말해요</span>
                  <div className="cq-preview-bubble">{sampleDialogue}</div>
                </div>
              </div>
              <div className="cq-btn-row">
                <button className="cq-btn-secondary" onClick={() => transition(2)}>← 수정하기</button>
                <button className="cq-btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? '생성 중…' : `${mode === 'edit' ? '저장' : '캐릭터 만들기'} ✦`}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
