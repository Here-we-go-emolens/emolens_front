import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import SidebarRight from '../../components/Sidebar-right/SidebarRight';
import WeatherCard from '../../components/WeatherCard/WeatherCard';
import { getDiaryList } from '@/services/diaryApi';
import "@/styles/Home/Home.css";

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const STATUS_LABEL = {
  COMPLETED: '✦ 분석완료',
  ANALYZING: '⏳ 분석중',
  PENDING:   '⏳ 대기중',
  FAILED:    '⚠ 실패',
};

const formatDate = (dateStr) => dateStr?.replace(/-/g, '.') ?? '';

const Home = () => {
  const navigate = useNavigate();
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const dayOfWeek = DAYS[now.getDay()];

  const [diaries, setDiaries]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchType,  setSearchType]  = useState('제목');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getDiaryList(0, 50)
      .then((data) => setDiaries(data.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = diaries.filter(d => {
    if (!searchQuery) return true;
    if (searchType === '제목') return d.title.includes(searchQuery);
    if (searchType === '날짜') return formatDate(d.diaryDate).includes(searchQuery);
    return true;
  });

  return (
    <div className="home-layout">
      <SidebarLeft />

      <main className="main-content">

        {/* ① 상단 정보 바 */}
        <div className="info-bar card">
          <div className="info-date">
            <span className="date-text">
              {year} <span className="date-sep">/</span> {month} <span className="date-sep">/</span> {day}
            </span>
            <span className="date-day">{dayOfWeek}요일</span>
          </div>
          <div className="info-weather">
            <WeatherCard size={38} />
            <span className="weather-city">서울</span>
          </div>
        </div>

        {/* ② 주간 감정 그래프 잠금 + 리포트 배너 (2열) */}
        <div className="home-premium-row">

          {/* 주간 감정 그래프 미리보기 */}
          <div className="home-graph-lock card">
            <div className="hgl-head">
              <span className="hgl-title">이번 주 감정 흐름</span>
              <span className="hgl-period">최근 7일</span>
            </div>
            <div className="hgl-chart-preview">
              {/* 블러 처리된 미니 그래프 */}
              <svg viewBox="0 0 260 70" className="hgl-svg">
                <polyline
                  points="0,50 40,35 80,55 120,20 160,40 200,28 260,45"
                  fill="none" stroke="#7c6fcd" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <polyline
                  points="0,50 40,35 80,55 120,20 160,40 200,28 260,45"
                  fill="url(#grad)" stroke="none"
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c6fcd" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#7c6fcd" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="hgl-blur-overlay">
                <span className="hgl-lock-icon">🔒</span>
                <p className="hgl-lock-msg">7일 전체 감정 흐름이 여기 있어요</p>
                <button className="hgl-cta" onClick={() => navigate('/premium')}>
                  Premium에서 보기
                </button>
              </div>
            </div>
          </div>

          {/* 주간 리포트 잠금 배너 */}
          <div className="home-report-lock card">
            <div className="hrl-icon">📋</div>
            <div className="hrl-body">
              <span className="hrl-label">주간 감정 리포트</span>
              <p className="hrl-msg">
                지난 주 감정 리포트가 완성됐어요.<br />
                어떤 순간이 가장 힘들었는지 정리해뒀어요.
              </p>
            </div>
            <button className="hrl-cta" onClick={() => navigate('/premium')}>
              🔒 리포트 보기
            </button>
          </div>

        </div>

        {/* ③ 감정 분석 요약 */}
        <div className="emotion-summary card">
          <div className="summary-item">
            <span className="summary-label">총 감정 요약</span>
            <div className="emotion-chips">
              <span className="chip chip-happy">😊 행복 42%</span>
              <span className="chip chip-calm">😌 평온 28%</span>
              <span className="chip chip-sad">😔 우울 18%</span>
              <span className="chip chip-angry">😤 분노 12%</span>
            </div>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-label">연속 기록일</span>
            <span className="summary-value">🔥 14일 연속</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-label">이번 주 키워드</span>
            <div className="kw-chips">
              <span className="kw-chip">#산책</span>
              <span className="kw-chip">#커피</span>
              <span className="kw-chip">#피로</span>
              <span className="kw-chip">#독서</span>
            </div>
          </div>
          <div className="summary-divider" />
          <div className="summary-item summary-item-wide">
            <span className="summary-label">주간 분석</span>
            <span className="summary-analysis">
              이번 주는 전반적으로 안정적인 감정 상태였어요. 중반에 업무 스트레스가 있었지만 주말로 갈수록 회복되는 패턴이 보여요.
            </span>
          </div>
        </div>

        {/* ③ 내 일기 리스트 */}
        <div className="diary-section card">
          <div className="diary-header">
            <h2 className="diary-title">내 일기 리스트</h2>
            <div className="diary-controls">
              <div className="search-group">
                <select
                  className="search-select"
                  value={searchType}
                  onChange={e => setSearchType(e.target.value)}
                >
                  <option>날짜</option>
                  <option>감정</option>
                  <option>제목</option>
                </select>
                <input
                  className="search-input"
                  type="text"
                  placeholder={`${searchType}으로 검색`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="write-btn" onClick={() => navigate('/write')}>✏️ 일기 작성</button>
            </div>
          </div>

          <div className="diary-table">
            <div className="diary-table-head">
              <span>제목</span>
              <span>날짜</span>
              <span>AI 분석</span>
              <span>공개</span>
            </div>
            {loading ? (
              <div className="diary-empty">불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div className="diary-empty">일기가 없습니다.</div>
            ) : (
              filtered.map(d => (
                <div key={d.id} className="diary-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/diary/${d.id}`)}>
                  <span className="dr-title">{d.title}</span>
                  <span className="dr-date">{formatDate(d.diaryDate)}</span>
                  <span className="dr-emotion">{STATUS_LABEL[d.status] ?? '-'}</span>
                  <span className="dr-keywords">{d.isSecret ? '🔒 비공개' : '🌐 공개'}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      <SidebarRight />
    </div>
  );
};

export default Home;
