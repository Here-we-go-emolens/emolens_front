import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentWeather } from '@/api/Weather/Weather';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { createDiary, uploadImage } from '@/services/diaryApi';
import '@/styles/CreateDiary/DiaryWritePage.css';

const TEMPLATES = [
  { id: 'plain',    label: '내지',   icon: '📄', desc: '빈 페이지 형식' },
  { id: 'notebook', label: '공책',   icon: '📓', desc: '줄 노트 형식' },
  { id: 'letter',   label: '편지',   icon: '✉️', desc: '편지 형식으로' },
];

function getWeatherEmoji(id) {
  if (!id) return '🌡️';
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800) return '☀️';
  if (id === 801) return '🌤️';
  if (id === 802) return '⛅';
  return '☁️';
}

const today = new Date().toISOString().split('T')[0];

export default function DiaryWritePage() {
  const navigate = useNavigate();
  const [showModal, setShowModal]           = useState(false);
  const [mode, setMode]                     = useState('normal');
  const [title, setTitle]                   = useState('');
  const [date, setDate]                     = useState(today);
  const [content, setContent]               = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('plain');

  // 편지 형식용
  const [letterTo, setLetterTo]   = useState('');
  const [letterFrom, setLetterFrom] = useState('');

  // 음성 인식
  const { isSupported: micSupported, isRecording, interimText, toggle: toggleMic } =
    useSpeechRecognition({
      onFinalResult: (text) =>
        setContent(prev => prev + (prev && !prev.endsWith('\n') ? ' ' : '') + text),
    });

  const [weather, setWeather]               = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError]     = useState('');

  useEffect(() => {
    getCurrentWeather('Seoul')
      .then(data => setWeather({
        desc: data.weather[0].description,
        temp: Math.round(data.main.temp),
        id:   data.weather[0].id,
      }))
      .catch(() => setWeatherError('날씨 정보를 불러오지 못했습니다.'))
      .finally(() => setWeatherLoading(false));
  }, []);

  const handleModeSelect = (m) => {
    setShowModal(false);
    if (m === 'ai') { navigate('/ai-chat'); return; }
    setMode(m);
  };

  const getWeatherEnum = (id) => {
    if (!id) return null;
    if (id === 800 || id === 801) return 'SUNNY';
    if (id >= 802 && id <= 804) return 'CLOUDY';
    if ((id >= 300 && id < 400) || (id >= 500 && id < 600)) return 'RAINY';
    if (id >= 600 && id < 700) return 'SNOWY';
    return 'CLOUDY';
  };

  const buildContent = () => {
    if (selectedTemplate === 'letter') {
      return [
        letterTo   && `To. ${letterTo}`,
        content,
        letterFrom && `From. ${letterFrom}`,
      ].filter(Boolean).join('\n\n');
    }
    return content;
  };

  const [imageUrls, setImageUrls]   = useState([]);
  const [uploading, setUploading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleImageRemove = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
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

  // 날씨 렌더
  const WeatherBadge = () => {
    if (weatherLoading) return <span className="meta-sub">불러오는 중…</span>;
    if (weatherError)   return <span className="meta-sub meta-err">{weatherError}</span>;
    if (weather)        return (
      <span className="meta-weather">
        {getWeatherEmoji(weather.id)}&nbsp;{weather.desc}&nbsp;·&nbsp;{weather.temp}°C
      </span>
    );
    return null;
  };

  // 공통 메타 (제목·날짜·날씨)
  const PaperMeta = () => (
    <>
      <input
        className="dw-title"
        type="text"
        placeholder="오늘의 제목을 입력하세요"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <div className="dw-meta">
        <div className="meta-row">
          <span className="meta-label">날짜</span>
          <input className="meta-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="meta-row">
          <span className="meta-label">날씨</span>
          <WeatherBadge />
        </div>
      </div>
      <div className="dw-rule" />
    </>
  );

  // 마이크 버튼
  const MicIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );

  const MicButton = () => {
    if (!micSupported) {
      return (
        <button className="dw-mic-btn" disabled title="이 브라우저는 음성 입력을 지원하지 않습니다 (Chrome 권장)">
          <MicIcon />
          음성 입력
        </button>
      );
    }
    return (
      <button className={`dw-mic-btn${isRecording ? ' recording' : ''}`} onClick={toggleMic}>
        <MicIcon />
        {isRecording ? '녹음 중지' : '음성 입력'}
      </button>
    );
  };

  // 이미지 미리보기
  const ImagePreview = () => {
    if (imageUrls.length === 0) return null;
    return (
      <div className="dw-image-preview">
        {imageUrls.map((url, i) => {
          const src = url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
          return (
            <div key={i} className="dw-preview-item">
              <img src={src} alt={`첨부 이미지 ${i + 1}`} />
              <button className="dw-preview-remove" onClick={() => handleImageRemove(i)} title="삭제">✕</button>
            </div>
          );
        })}
      </div>
    );
  };

  // 하단 완료 버튼
  const Footer = ({ count }) => (
    <div className="dw-footer">
      <span className="dw-count">{count}자</span>
      <label className={`dw-img-btn${uploading ? ' uploading' : ''}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        {uploading ? '업로드 중…' : '사진 추가'}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} disabled={uploading} />
      </label>
      <MicButton />
      <button className="dw-submit" onClick={handleSubmit} disabled={submitting || uploading}>
        {submitting ? '저장 중…' : '완료'}
      </button>
    </div>
  );

  // ── 형식별 본문 렌더 ───────────────────────────
  const renderBody = () => {
    switch (selectedTemplate) {

      case 'notebook':
        return (
          <div className={`dw-paper dw-paper--notebook`}>
            {PaperMeta()}
            <div className="notebook-body-wrap">
              <textarea
                className="dw-body nb-body"
                placeholder="오늘 하루를 자유롭게 기록해보세요…"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
            {interimText && <p className="dw-interim">{interimText}</p>}
            <ImagePreview />
            <Footer count={content.length} />
          </div>
        );

      case 'letter':
        return (
          <div className={`dw-paper dw-paper--letter`}>
            <div className="letter-deco">✦ &nbsp; emolens diary &nbsp; ✦</div>
            {PaperMeta()}
            <div className="letter-to-row">
              <span className="meta-label">To.</span>
              <input
                className="letter-to-input"
                type="text"
                placeholder="받는 사람 (미래의 나, 누군가에게…)"
                value={letterTo}
                onChange={e => setLetterTo(e.target.value)}
              />
            </div>
            <textarea
              className="dw-body letter-body"
              placeholder={"안녕,\n\n오늘은 이런 하루를 보냈어…"}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            {interimText && <p className="dw-interim">{interimText}</p>}
            <div className="letter-from-row">
              <span className="meta-label">From.</span>
              <input
                className="letter-to-input"
                type="text"
                placeholder="보내는 사람"
                value={letterFrom}
                onChange={e => setLetterFrom(e.target.value)}
              />
            </div>
            <ImagePreview />
            <Footer count={content.length} />
          </div>
        );

      default: // plain
        return (
          <div className={`dw-paper dw-paper--plain`}>
            <div className="paper-stripe" />
            {PaperMeta()}
            <textarea
              className="dw-body"
              placeholder="오늘 하루를 자유롭게 기록해보세요…"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            {interimText && <p className="dw-interim">{interimText}</p>}
            <ImagePreview />
            <Footer count={content.length} />
          </div>
        );
    }
  };

  return (
    <div className="dw-layout">
      <SidebarLeft />

      <main className="dw-main">
        <div className="dw-topbar">
          <button className="dw-mode-btn" onClick={() => setShowModal(true)}>
            {mode === 'normal' ? '📝 일반 일기 작성' : '🤖 AI 대화형 일기'}
            <span className="dw-arrow">▾</span>
          </button>
        </div>

        {mode === 'normal'
          ? renderBody()
          : (
            <div className="dw-paper dw-ai-notice">
              <span className="ai-big-icon">🤖</span>
              <h3>AI 대화형 일기 작성</h3>
              <p>AI와 질문·답변을 주고받으며 오늘의 감정을 정리해보세요.<br />이 기능은 곧 제공될 예정입니다.</p>
              <button className="dw-back-btn" onClick={() => setMode('normal')}>일반 일기로 돌아가기</button>
            </div>
          )
        }
      </main>

      {/* 오른쪽 패널 */}
      <aside className="dw-panel">
        <p className="panel-title">일기 형식</p>
        <div className="tpl-list">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              className={`tpl-item ${selectedTemplate === t.id ? 'active' : ''}`}
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
        <p className="panel-hint">형식을 선택하면 일기장 스타일이 달라져요.</p>
      </aside>

      {/* 팝업 모달 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span>일기 작성 방식 선택</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-cards">
              <button
                className={`mcard ${mode === 'normal' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('normal')}
              >
                <div className="mcard-head"><span>📝</span><strong>일반 일기 작성</strong></div>
                <p className="mcard-desc">자유롭게 하루를 기록하는 기본 일기 형식</p>
                <div className="mcard-example">
                  "오늘은 오랜만에 하늘이 맑아서 기분이 조금 가벼웠다. 수업이 끝난 뒤 카페에 들렀고, 생각보다 차분한 하루를 보냈다."
                </div>
              </button>
              <button
                className={`mcard ${mode === 'ai' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('ai')}
              >
                <div className="mcard-head"><span>🤖</span><strong>인공지능 대화형 일기</strong></div>
                <p className="mcard-desc">질문과 답변을 주고받으며 감정을 더 쉽게 정리하는 형식</p>
                <div className="mcard-example ai-chat">
                  <div className="chat-line ai"><b>AI</b> 오늘 가장 기억에 남는 순간은 뭐였나요?</div>
                  <div className="chat-line me"><b>나</b> 친구와 잠깐 산책한 시간이 가장 편안했어요.</div>
                  <div className="chat-line ai"><b>AI</b> 그때 어떤 감정이 들었나요?</div>
                  <div className="chat-line me"><b>나</b> 복잡했던 마음이 조금 가라앉는 느낌이었어요.</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
