import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import { useCharacter } from '@/hooks/useCharacter';
import '@/styles/Character/CharacterSetupPage.css';

const TONE_OPTIONS = [
  { value: 'FRIENDLY_INFORMAL', label: '다정한 반말', sample: '오늘 힘든 일이 있었구나. 그래도 여기까지 잘 버텼어.' },
  { value: 'WARM_FORMAL', label: '따뜻한 존댓말', sample: '오늘 많이 지치셨겠어요. 그래도 충분히 잘해오셨습니다.' },
  { value: 'PLAYFUL', label: '발랄한 반말', sample: '오늘 진짜 고생 많았네. 일단 여기 와서 말해준 것만으로도 잘했어.' },
  { value: 'COOL', label: '냉철한 존댓말', sample: '오늘 상황이 꽤 버거우셨겠네요. 지금은 감정을 차분히 정리해보면 좋겠습니다.' },
];

const PERSONALITY_OPTIONS = [
  { value: 'EMPATHETIC', label: '공감형', desc: '감정을 충분히 받아주고 위로에 집중해요.' },
  { value: 'POSITIVE', label: '긍정형', desc: '밝고 희망적인 시각으로 응원해요.' },
  { value: 'DIRECT', label: '직설형', desc: '핵심을 짚고 분명하게 말해줘요.' },
  { value: 'PHILOSOPHICAL', label: '철학형', desc: '깊이 있는 통찰과 질문으로 반응해요.' },
];

const MUSIC_OPTIONS = [
  { value: 'ANY', label: '장르 무관' },
  { value: 'KPOP', label: 'K-POP' },
  { value: 'INDIE', label: '인디' },
  { value: 'JAZZ', label: '재즈' },
  { value: 'CLASSICAL', label: '클래식' },
  { value: 'HIPHOP', label: '힙합' },
  { value: 'POP', label: '팝' },
];

const ACTIVITY_OPTIONS = [
  { value: 'ANY', label: '활동 무관' },
  { value: 'OUTDOOR', label: '야외 활동' },
  { value: 'INDOOR', label: '실내 활동' },
  { value: 'SOCIAL', label: '함께하는 활동' },
  { value: 'SOLO', label: '혼자 하는 활동' },
  { value: 'CREATIVE', label: '창작 활동' },
];

const EMPTY_FORM = {
  name: '',
  tone: 'FRIENDLY_INFORMAL',
  personality: 'EMPATHETIC',
  musicGenre: 'ANY',
  activityType: 'ANY',
};

function buildPreview(form) {
  const tone = TONE_OPTIONS.find((item) => item.value === form.tone);
  const personality = PERSONALITY_OPTIONS.find((item) => item.value === form.personality);

  return {
    intro: tone?.sample ?? '',
    title: `${form.name || '이 캐릭터'}가 이런 방식으로 함께할 거예요`,
    subtitle: personality?.desc ?? '',
  };
}

export default function CharacterSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = new URLSearchParams(location.search).get('next') || '/ai-chat';
  const { character, loading, notFound, saveCharacter } = useCharacter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [mode, setMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (character) {
      setForm({
        name: character.name ?? '',
        tone: character.tone ?? 'FRIENDLY_INFORMAL',
        personality: character.personality ?? 'EMPATHETIC',
        musicGenre: character.musicGenre ?? 'ANY',
        activityType: character.activityType ?? 'ANY',
      });
      setMode('edit');
      return;
    }

    if (notFound) {
      setForm(EMPTY_FORM);
      setMode('create');
    }
  }, [character, loading, notFound]);

  const preview = useMemo(() => buildPreview(form), [form]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setToast({ type: 'error', message: '캐릭터 이름을 입력해주세요.' });
      return;
    }

    setSubmitting(true);
    try {
      await saveCharacter(
        {
          ...form,
          name: form.name.trim(),
        },
        mode,
      );
      setToast({
        type: 'success',
        message: mode === 'edit' ? '캐릭터 설정을 저장했습니다.' : '캐릭터를 만들었습니다.',
      });
      setTimeout(() => navigate(nextPath), 700);
    } catch (err) {
      const message = err.response?.data?.message || '캐릭터 저장에 실패했습니다.';
      setToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="character-layout">
      <SidebarLeft />

      <main className="character-main">
        {toast && (
          <div className={`character-toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        <section className="character-hero">
          <div className="character-hero-copy">
            <span className="character-badge">AI Character Studio</span>
            <h1>{mode === 'edit' ? 'AI 캐릭터를 다시 다듬어보세요' : '나만의 AI 캐릭터를 만들어보세요'}</h1>
            <p>
              이 캐릭터는 대화형 일기와 감정 분석에서 같은 페르소나로 함께합니다.
              이름, 말투, 성격, 취향을 정하면 AI의 반응 방식이 바뀝니다.
            </p>
          </div>
          <div className="character-hero-preview">
            <div className="character-avatar-orb">{form.name?.trim()?.[0] || 'AI'}</div>
            <div className="character-preview-card">
              <div className="character-preview-name">{form.name || '이름을 정해주세요'}</div>
              <div className="character-preview-meta">
                <span>{TONE_OPTIONS.find((item) => item.value === form.tone)?.label}</span>
                <span>{PERSONALITY_OPTIONS.find((item) => item.value === form.personality)?.label}</span>
              </div>
              <p className="character-preview-line">{preview.intro}</p>
            </div>
          </div>
        </section>

        <section className="character-content">
          <form className="character-form-card" onSubmit={handleSubmit}>
            <div className="character-section-head">
              <h2>캐릭터 설정</h2>
              <p>생성 후에도 언제든 수정할 수 있습니다.</p>
            </div>

            <label className="character-field">
              <span>캐릭터 이름</span>
              <input
                type="text"
                maxLength={20}
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="예: 루미, 모카, 하루"
              />
            </label>

            <div className="character-choice-grid">
              <div className="character-choice-block">
                <h3>말투</h3>
                <div className="choice-list">
                  {TONE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`choice-card ${form.tone === option.value ? 'active' : ''}`}
                      onClick={() => updateField('tone', option.value)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.sample}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="character-choice-block">
                <h3>성격</h3>
                <div className="choice-list">
                  {PERSONALITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`choice-card ${form.personality === option.value ? 'active' : ''}`}
                      onClick={() => updateField('personality', option.value)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="character-select-row">
              <label className="character-field">
                <span>선호 음악 장르</span>
                <select value={form.musicGenre} onChange={(e) => updateField('musicGenre', e.target.value)}>
                  {MUSIC_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="character-field">
                <span>선호 활동 유형</span>
                <select value={form.activityType} onChange={(e) => updateField('activityType', e.target.value)}>
                  {ACTIVITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="character-actions">
              <button type="button" className="character-secondary-btn" onClick={() => navigate('/home')}>
                나중에 할게요
              </button>
              <button type="submit" className="character-primary-btn" disabled={submitting || loading}>
                {submitting ? '저장 중…' : mode === 'edit' ? '캐릭터 저장하기' : '캐릭터 만들기'}
              </button>
            </div>
          </form>

          <aside className="character-side-card">
            <div className="character-section-head">
              <h2>미리보기</h2>
              <p>대화형 일기와 감정 분석에 반영됩니다.</p>
            </div>

            <div className="character-preview-panel">
              <div className="preview-chip-row">
                <span>{TONE_OPTIONS.find((item) => item.value === form.tone)?.label}</span>
                <span>{PERSONALITY_OPTIONS.find((item) => item.value === form.personality)?.label}</span>
              </div>
              <h3>{preview.title}</h3>
              <p>{preview.subtitle}</p>

              <div className="character-chat-sample">
                <div className="sample-avatar">{form.name?.trim()?.[0] || 'AI'}</div>
                <div className="sample-bubble">
                  {preview.intro}
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
