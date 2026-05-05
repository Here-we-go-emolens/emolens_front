import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentWeather } from '@/api/Weather/Weather';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { createDiary, uploadImage } from '@/services/diaryApi';
import mascotImg from '@/assets/mascot.png';
import '@/styles/CreateDiary/DiaryWritePage.css';

const TEMPLATES = [
  { id: 'plain',    label: '내지',  icon: '📄', desc: '빈 페이지 형식' },
  { id: 'notebook', label: '공책',  icon: '📓', desc: '줄 노트 형식' },
  { id: 'letter',   label: '편지',  icon: '✉️', desc: '편지 형식으로' },
];

const EMOTIONS = [
  { id: 'happy',   label: '행복',   emoji: '😊', bg: '#FFFCE8', cardBg: '#FFFDF0', border: '#F5D050', glow: 'rgba(245, 208, 80, 0.38)' },
  { id: 'excited', label: '설렘',   emoji: '🌸', bg: '#FFF0F5', cardBg: '#FFF5F9', border: '#F5A8C0', glow: 'rgba(245, 168, 192, 0.38)' },
  { id: 'calm',    label: '평온',   emoji: '😌', bg: '#EDFAF4', cardBg: '#F3FCF7', border: '#7DC9A0', glow: 'rgba(125, 201, 160, 0.38)' },
  { id: 'anxious', label: '불안',   emoji: '😟', bg: '#F2EEFF', cardBg: '#F7F3FF', border: '#A090D8', glow: 'rgba(160, 144, 216, 0.38)' },
  { id: 'down',    label: '우울',   emoji: '😢', bg: '#EEF4FF', cardBg: '#F3F7FF', border: '#6898D8', glow: 'rgba(104, 152, 216, 0.38)' },
  { id: 'tired',   label: '피곤함', emoji: '😴', bg: '#F5F0E8', cardBg: '#FAF6EE', border: '#C0A878', glow: 'rgba(192, 168, 120, 0.38)' },
];

// 배열 셔플 유틸
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 감정 미선택 시 공통 질문 (flat)
const GENERAL_QUESTIONS = [
  '오늘 가장 오래 남은 감정은 무엇인가요?',
  '그 감정은 언제부터 시작됐나요?',
  '오늘 나에게 가장 좋았던 순간은?',
  '지금 이 순간 가장 솔직한 내 마음은?',
  '오늘 하루를 색깔로 표현한다면 무슨 색인가요?',
  '오늘 가장 기억에 남는 장면을 묘사해보세요',
  '내일의 나에게 해주고 싶은 말은?',
  '오늘 가장 잘 버텨낸 순간은?',
  '오늘 예상치 못했던 일이 있었나요?',
  '지금 내 옆에 있어줬으면 하는 사람은 누구인가요?',
  '오늘 위로받고 싶었던 순간이 있었나요?',
  '지금 나에게 가장 필요한 것은 무엇인가요?',
  '내일은 어떤 하루이길 바라나요?',
  '오늘 나를 가장 나답게 만든 순간은?',
  '이 일기를 미래의 내가 읽는다면 어떤 말을 전하고 싶나요?',
  '오늘 하루를 한 문장으로 표현한다면?',
  '가장 솔직하게 느낀 감정은 무엇인가요?',
  '오늘 나 자신에게 고마운 점이 있다면?',
  '지금 마음속 가장 큰 생각은 무엇인가요?',
  '오늘을 통해 나에 대해 새롭게 알게 된 것은?',
];

// 감정별 맞춤 질문 (flat)
const EMOTION_QUESTIONS = {
  happy: [
    '행복을 느꼈던 순간을 자세히 묘사해보세요',
    '그 기쁨을 누구와 나누고 싶었나요?',
    '이 행복이 어디서 왔다고 생각하나요?',
    '오늘 가장 환하게 웃었던 순간은?',
    '이 행복을 오래 기억하려면 어떻게 하면 좋을까요?',
    '오늘 나를 웃게 한 것은 무엇인가요?',
    '행복한 오늘을 만들어준 사람이 있나요?',
    '이 감정을 내일도 이어가려면 어떻게 하면 좋을까요?',
    '행복할 때 나는 어떤 사람이 되나요?',
    '오늘의 행복을 한 단어로 표현한다면?',
    '소소하지만 확실했던 행복은 무엇인가요?',
    '오늘 가장 감사했던 순간은 언제인가요?',
    '이 기분을 느낄 수 있게 해준 환경이나 조건이 있나요?',
    '행복한 지금, 나에게 선물하고 싶은 것이 있다면?',
    '오늘의 행복을 미래의 나에게 어떻게 전달하고 싶나요?',
  ],
  excited: [
    '무엇이 당신을 이렇게 설레게 했나요?',
    '그 설렘은 어디서 시작됐나요?',
    '설레는 마음을 어떻게 표현했나요?',
    '설렘 뒤에 조금 두려운 마음도 있나요?',
    '이 기대감이 현실이 된다면 어떨 것 같나요?',
    '앞으로 더 기대되는 것이 있나요?',
    '설렘과 함께 느껴지는 다른 감정은?',
    '이 에너지를 내일 어떻게 활용하고 싶나요?',
    '설레는 마음을 오래 간직하려면 어떻게 해야 할까요?',
    '설렘을 느낄 때 몸의 반응은 어떤가요?',
    '설레는 지금 이 순간 가장 하고 싶은 것은?',
    '이 설렘이 나에게 가르쳐주는 것은 무엇인가요?',
    '설렘을 느낄 때 나는 어떤 모습인가요?',
    '지금 이 설렘을 누군가에게 전한다면 어떻게 표현할 건가요?',
    '기대가 현실이 되는 순간을 상상해보세요',
  ],
  calm: [
    '오늘 평온함을 느낀 순간은 언제였나요?',
    '그 고요함이 어디서 왔다고 생각하나요?',
    '평온한 오늘을 만들어준 것은 무엇인가요?',
    '이 차분함 속에서 어떤 생각이 가장 많이 떠올랐나요?',
    '평온할 때 나는 어떤 사람이 되나요?',
    '지금 이 평온함을 더 오래 유지하려면?',
    '마음이 편안할 때 어떤 생각이 떠오르나요?',
    '오늘 나에게 충분했던 것은 무엇인가요?',
    '평온한 마음으로 새롭게 보이는 것이 있나요?',
    '이 차분한 에너지로 하고 싶은 것은 무엇인가요?',
    '평온함 속에서 깨달은 것이 있나요?',
    '오늘 가장 여유로웠던 순간을 묘사해보세요',
    '평온함이 습관이 되려면 어떤 것이 필요할까요?',
    '지금 이 고요함 속에 감사한 것이 있다면?',
    '평온한 오늘이 내일에게 주는 선물은 무엇인가요?',
  ],
  anxious: [
    '지금 가장 마음에 걸리는 것은 무엇인가요?',
    '그 불안은 언제부터 시작됐나요?',
    '지금 당장 할 수 있는 가장 작은 한 가지는?',
    '불안을 느낄 때 몸이 어떻게 반응하나요?',
    '불안한 나에게 친구처럼 말해준다면 뭐라고 할 건가요?',
    '불안이 말하려는 것이 있다면 무엇일까요?',
    '과거에 비슷한 불안을 어떻게 넘겼나요?',
    '지금 나에게 가장 필요한 위로는?',
    '이 걱정이 실제로 일어날 가능성은 얼마나 될까요?',
    '불안을 줄여주는 나만의 방법이 있나요?',
    '불안 뒤에 숨어있는 진짜 감정은 무엇인가요?',
    '지금 이 불안을 내려놓는다면 어떤 기분일까요?',
    '내가 통제할 수 있는 것과 없는 것을 나눠본다면?',
    '불안 속에서도 내가 잘하고 있는 것은 무엇인가요?',
    '지금 당장 나를 안심시켜줄 수 있는 것은?',
  ],
  down: [
    '오늘 마음이 무거웠던 이유는 무엇인가요?',
    '그 감정을 혼자 안고 있었나요?',
    '지금 나에게 따뜻한 말 한마디를 건넨다면?',
    '지금 이 감정이 얼마나 오래된 것 같나요?',
    '마음이 무거울 때 나는 어디로 가고 싶어지나요?',
    '우울함 속에서도 버텨낸 순간이 있었나요?',
    '지금 가장 듣고 싶은 말은 무엇인가요?',
    '내일은 조금 나아질 것 같은 이유가 있나요?',
    '지금 나를 가장 힘들게 하는 생각은 무엇인가요?',
    '이 감정을 색깔로 표현한다면 어떤 색인가요?',
    '이 감정이 전하려는 메시지가 있다면?',
    '지금 가장 필요한 것은 위로인가요, 해결책인가요?',
    '우울한 나를 가장 이해해줄 수 있는 사람은 누구인가요?',
    '이 감정이 지나고 나면 무엇이 남을 것 같나요?',
    '지금 당장 나를 조금 편하게 해줄 수 있는 것은?',
  ],
  tired: [
    '오늘 무엇이 나를 가장 지치게 했나요?',
    '몸과 마음 중 어느 쪽이 더 피곤한가요?',
    '지금 가장 쉬고 싶은 방식은 무엇인가요?',
    '피곤함이 쌓이기 시작한 것은 언제부터인가요?',
    '지금 내게 가장 필요한 것은 수면인가요, 감정적 회복인가요?',
    '피곤함 속에서도 해낸 것이 있다면 무엇인가요?',
    '내가 덜 지치려면 무엇이 달라져야 할까요?',
    '오늘 나 자신을 위한 작은 선물을 준다면?',
    '피곤할 때 나는 어떤 것에 가장 예민해지나요?',
    '충전이 되는 나만의 방법이 있나요?',
    '피곤한 오늘, 그래도 고마운 순간이 있었나요?',
    '충전을 위해 지금 당장 할 수 있는 것은?',
    '나를 지치게 하는 것과 채워주는 것은 각각 무엇인가요?',
    '지금 이 피곤함을 누군가에게 털어놓는다면?',
    '오늘 수고한 나에게 어떤 말을 해주고 싶나요?',
  ],
};

// 말풍선 문구도 감정에 맞게
const COMPANION_MESSAGES = {
  happy:   '행복한 오늘을\n더 자세히 기억해봐요 😊',
  excited: '설레는 마음을\n글로 담아볼까요? 🌸',
  calm:    '고요한 마음으로\n천천히 적어보세요 😌',
  anxious: '불안해도 괜찮아요,\n함께 풀어봐요 🤗',
  down:    '힘든 마음, 여기서\n털어놓아도 돼요 💙',
  tired:   '오늘도 수고했어요.\n천천히 돌아봐요 😴',
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(d) {
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')} (${DAYS[d.getDay()]})`;
}

function getWeatherEmoji(id) {
  if (!id) return '🌡️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id === 800) return '☀️';
  if (id <= 802) return '🌤️';
  return '☁️';
}

function getWeatherLabel(id) {
  if (!id) return '';
  if (id === 800) return '맑음';
  if (id <= 802) return '구름 조금';
  if (id <= 804) return '흐림';
  if (id >= 500 && id < 600) return '비';
  if (id >= 600 && id < 700) return '눈';
  return '흐림';
}

const today = new Date().toISOString().split('T')[0];

export default function DiaryWritePage() {
  const navigate = useNavigate();
  const [title, setTitle]                       = useState('');
  const [date]                                  = useState(today);
  const [content, setContent]                   = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('plain');
  const [selectedEmotion, setSelectedEmotion]   = useState(null);
  const [currentPrompts, setCurrentPrompts]     = useState([]);
  const [questionQueue, setQuestionQueue]       = useState([]);
  const [letterTo, setLetterTo]                 = useState('');
  const [letterFrom, setLetterFrom]             = useState('');
  const [imageUrls, setImageUrls]               = useState([]);
  const [uploading, setUploading]               = useState(false);
  const [submitting, setSubmitting]             = useState(false);
  const [weather, setWeather]                   = useState(null);

  // 감정 바뀌면 해당 풀을 셔플하여 초기화
  useEffect(() => {
    const pool = (selectedEmotion && EMOTION_QUESTIONS[selectedEmotion]) || GENERAL_QUESTIONS;
    const shuffled = shuffle(pool);
    setCurrentPrompts(shuffled.slice(0, 3));
    setQuestionQueue(shuffled.slice(3));
  }, [selectedEmotion]);

  const { isSupported: micSupported, isRecording, interimText, toggle: toggleMic } =
    useSpeechRecognition({
      onFinalResult: (text) =>
        setContent(prev => prev + (prev && !prev.endsWith('\n') ? ' ' : '') + text),
    });

  useEffect(() => {
    getCurrentWeather('Seoul')
      .then(data => setWeather({ id: data.weather[0].id }))
      .catch(() => {});
  }, []);

  const selectedEmotionData = EMOTIONS.find(e => e.id === selectedEmotion) || null;
  const speechText = (selectedEmotion && COMPANION_MESSAGES[selectedEmotion]) || '오늘의 마음을\n천천히 들여다볼게요 😊';

  const handleNewPrompts = () => {
    const pool = (selectedEmotion && EMOTION_QUESTIONS[selectedEmotion]) || GENERAL_QUESTIONS;
    let queue = [...questionQueue];
    if (queue.length < 3) {
      // 바닥나면 현재 표시 중인 것 제외하고 다시 셔플
      const remaining = shuffle(pool.filter(q => !currentPrompts.includes(q)));
      queue = [...queue, ...remaining];
    }
    setCurrentPrompts(queue.slice(0, 3));
    setQuestionQueue(queue.slice(3));
  };

  const getWeatherEnum = (id) => {
    if (!id) return null;
    if (id === 800 || id === 801) return 'SUNNY';
    if (id >= 802 && id <= 804) return 'CLOUDY';
    if (id >= 500 && id < 600) return 'RAINY';
    if (id >= 600 && id < 700) return 'SNOWY';
    return 'CLOUDY';
  };

  const buildContent = () => {
    if (selectedTemplate === 'letter') {
      return [letterTo && `To. ${letterTo}`, content, letterFrom && `From. ${letterFrom}`]
        .filter(Boolean).join('\n\n');
    }
    return content;
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrls(prev => [...prev, url]);
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    const finalContent = buildContent();
    if (!title.trim()) { alert('제목을 입력해주세요.'); return; }
    if (!finalContent.trim()) { alert('내용을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const id = await createDiary({
        title: title.trim(),
        content: finalContent,
        diaryDate: date,
        weather: getWeatherEnum(weather?.id),
        isSecret: false,
        imageUrls,
      });
      localStorage.setItem(`diary_template_${id}`, selectedTemplate);
      navigate(`/diary/${id}`);
    } catch {
      alert('일기 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const today_date = new Date();

  return (
    <div className="dw-layout">
      <SidebarLeft />

      <main className="dw-main">

        {/* ── 페이지 헤더 ── */}
        <div className="dw-page-header">
          <h1 className="dw-page-title">오늘의 일기 ✍️</h1>
          <p className="dw-page-sub">감정을 먼저 고르고, 마음을 천천히 기록해보세요</p>
        </div>

        {/* ── Step 1: 감정 선택 (DOMINANT) ── */}
        <section className="dw-emotion-section">
          <div className="dw-emotion-header">
            <span className="dw-emotion-q">지금 어떤 감정인가요?</span>
            {selectedEmotion && (
              <button className="dw-emotion-clear" onClick={() => setSelectedEmotion(null)}>
                초기화
              </button>
            )}
          </div>
          <div className="dw-emotion-grid">
            {EMOTIONS.map(e => (
              <button
                key={e.id}
                className={`emotion-chip${selectedEmotion === e.id ? ' selected' : ''}`}
                style={{
                  '--chip-bg': e.bg,
                  '--chip-border': e.border,
                  '--chip-glow': e.glow,
                }}
                onClick={() => setSelectedEmotion(prev => prev === e.id ? null : e.id)}
              >
                <span className="chip-emoji">{e.emoji}</span>
                <span className="chip-label">{e.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Step 2 & 3: 일기 카드 ── */}
        <div
          className="dw-card"
          style={{ backgroundColor: selectedEmotionData ? selectedEmotionData.cardBg : undefined }}
        >
          {/* 카드 상단: 제목 + 메타 */}
          <div className="dw-card-top">
            <input
              className="dw-title-input"
              type="text"
              placeholder="오늘 하루의 제목을 지어보세요"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={30}
            />
            <div className="dw-meta-row">
              <span className="dw-meta-pill">📅 {formatDate(today_date)}</span>
              {weather && (
                <span className="dw-meta-pill">
                  {getWeatherEmoji(weather.id)} {getWeatherLabel(weather.id)}
                </span>
              )}
              {selectedEmotionData && (
                <span
                  className="dw-meta-pill dw-emotion-pill"
                  style={{
                    background: selectedEmotionData.bg,
                    borderColor: selectedEmotionData.border,
                    color: '#555',
                  }}
                >
                  {selectedEmotionData.emoji} {selectedEmotionData.label}
                </span>
              )}
            </div>
          </div>

          {/* 편지 To */}
          {selectedTemplate === 'letter' && (
            <div className="dw-letter-row">
              <span className="dw-letter-label">To.</span>
              <input className="dw-letter-input" type="text"
                placeholder="받는 사람 (미래의 나, 누군가에게…)"
                value={letterTo} onChange={e => setLetterTo(e.target.value)} />
            </div>
          )}

          {/* 본문 textarea */}
          <div className={`dw-textarea-wrap${selectedTemplate === 'notebook' ? ' notebook' : ''}`}>
            <textarea
              className="dw-content-textarea"
              placeholder={
                selectedTemplate === 'letter'
                  ? '안녕,\n\n오늘은 이런 하루를 보냈어…'
                  : '오늘 있었던 일, 느꼈던 감정, 생각을 자유롭게 적어보세요...'
              }
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={2000}
            />
            {interimText && <p className="dw-interim">{interimText}</p>}
            <span className="dw-char-count textarea-count">{content.length}/2000</span>
          </div>

          {/* 편지 From */}
          {selectedTemplate === 'letter' && (
            <div className="dw-letter-row dw-letter-from">
              <span className="dw-letter-label">From.</span>
              <input className="dw-letter-input" type="text"
                placeholder="보내는 사람"
                value={letterFrom} onChange={e => setLetterFrom(e.target.value)} />
            </div>
          )}

          {/* 이미지 미리보기 */}
          {imageUrls.length > 0 && (
            <div className="dw-image-preview">
              {imageUrls.map((url, i) => {
                const src = url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
                return (
                  <div key={i} className="dw-preview-item">
                    <img src={src} alt={`첨부 이미지 ${i + 1}`} />
                    <button className="dw-preview-remove"
                      onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}>✕</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 카드 하단: 액션 */}
          <div className="dw-card-footer">
            <div className="dw-card-footer-left">
              <label className={`dw-action-btn${uploading ? ' disabled' : ''}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                {uploading ? '업로드 중…' : '사진 추가'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} disabled={uploading} />
              </label>

              <button
                className={`dw-action-btn${isRecording ? ' recording' : ''}${!micSupported ? ' disabled' : ''}`}
                onClick={micSupported ? toggleMic : undefined}
                disabled={!micSupported}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                {isRecording ? '녹음 중지' : '음성 입력'}
              </button>

              <span className="dw-title-count">{title.length}/30</span>
            </div>

            <button className="dw-submit-btn" onClick={handleSubmit} disabled={submitting || uploading}>
              {submitting ? '저장 중…' : '완료하기'}
              {!submitting && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <p className="dw-footer-note">🔒 일기는 나만 볼 수 있어요. 언제든 안전하게 수정하고 들여다볼 수 있습니다.</p>
      </main>

      {/* ── 오른쪽 패널 — AI 동반자 ── */}
      <aside className="dw-panel">

        {/* 동반자 카드 */}
        <div className="dw-companion-card">
          <div className="dw-companion-inner">
            <img src={mascotImg} alt="EmoLens 마스코트" className="dw-mascot" />
            <div className="dw-speech-bubble">
              {speechText.split('\n').map((line, i) => (
                <span key={i}>{line}{i < speechText.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>

          <p className="dw-companion-label">✨ 막막하면 질문을 골라보세요</p>

          <div className="dw-prompts">
            {currentPrompts.map((prompt, i) => (
              <button key={i} className="dw-prompt-bubble"
                onClick={() => setContent(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`)}>
                {prompt}
              </button>
            ))}
          </div>

          <button className="dw-new-prompt-btn"
            onClick={handleNewPrompts}>
            ↻ 새 질문 받기
          </button>
        </div>

        {/* 일기 형식 */}
        <div className="dw-panel-card">
          <div className="dw-panel-card-header">
            <span className="dw-panel-card-title">일기 형식</span>
          </div>
          <div className="tpl-list">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                className={`tpl-item${selectedTemplate === t.id ? ' active' : ''}`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                <span className="tpl-icon">{t.icon}</span>
                <div>
                  <span className="tpl-label">{t.label}</span>
                  <span className="tpl-desc">{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI 분석 미리보기 */}
        <div className="dw-panel-card dw-ai-preview">
          <div className="dw-ai-preview-header">
            <span className="dw-ai-preview-title">AI 분석 미리보기</span>
            <span className="dw-ai-preview-badge">Beta</span>
          </div>
          <p className="dw-ai-preview-text">
            일기를 완성하면 AI가 감정을 분석하고 맞춤 리포트를 제공해드려요.
          </p>
          <div className="dw-ai-preview-icon">📊</div>
        </div>

      </aside>
    </div>
  );
}
