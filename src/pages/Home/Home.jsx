import { useState } from 'react';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import SidebarRight from '../../components/Sidebar-right/SidebarRight';
import WeatherCard from '../../components/WeatherCard/WeatherCard';
import "@/styles/Home/Home.css";

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const diaries = [
  { id: 1, title: '오늘은 기분이 정말 좋았어',   date: '2026.03.31', emotion: '😊 행복', keywords: ['햇살', '산책', '커피'] },
  { id: 2, title: '조금 지친 하루였다',           date: '2026.03.30', emotion: '😔 우울', keywords: ['야근', '피로'] },
  { id: 3, title: '친구와 오랜만에 만남',          date: '2026.03.29', emotion: '🥰 설렘', keywords: ['우정', '식사', '대화'] },
  { id: 4, title: '업무 스트레스가 너무 심했다',   date: '2026.03.28', emotion: '😤 분노', keywords: ['회의', '스트레스'] },
  { id: 5, title: '조용히 혼자 쉰 날',            date: '2026.03.27', emotion: '😌 평온', keywords: ['휴식', '독서', '음악'] },
  { id: 6, title: '봄비가 내리던 오후',            date: '2026.03.26', emotion: '😊 행복', keywords: ['비', '창가', '따뜻함'] },
];

const Home = () => {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const dayOfWeek = DAYS[now.getDay()];

  const [searchType,  setSearchType]  = useState('제목');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = diaries.filter(d => {
    if (!searchQuery) return true;
    if (searchType === '제목') return d.title.includes(searchQuery);
    if (searchType === '감정') return d.emotion.includes(searchQuery);
    if (searchType === '날짜') return d.date.includes(searchQuery);
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

        {/* ② 감정 분석 요약 */}
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
              <button className="write-btn">✏️ 일기 작성</button>
            </div>
          </div>

          <div className="diary-table">
            <div className="diary-table-head">
              <span>제목</span>
              <span>날짜</span>
              <span>대표 감정</span>
              <span>키워드</span>
            </div>
            {filtered.length === 0 ? (
              <div className="diary-empty">검색 결과가 없습니다.</div>
            ) : (
              filtered.map(d => (
                <div key={d.id} className="diary-row">
                  <span className="dr-title">{d.title}</span>
                  <span className="dr-date">{d.date}</span>
                  <span className="dr-emotion">{d.emotion}</span>
                  <span className="dr-keywords">
                    {d.keywords.map(k => (
                      <span key={k} className="kw-small">#{k}</span>
                    ))}
                  </span>
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
