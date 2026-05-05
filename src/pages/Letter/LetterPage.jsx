import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import { getLetters, getLetter } from '@/services/letterApi';
import '@/styles/Letter/LetterPage.css';

const TYPE_LABEL = {
  DIARY_REPLY: '일기 답장',
  WEEKLY_REPORT: '주간 리포트',
};

const TYPE_ICON = {
  DIARY_REPLY: '💌',
  WEEKLY_REPORT: '📋',
};

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}

export default function LetterPage() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // LetterResponse

  useEffect(() => {
    getLetters()
      .then(setLetters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = async (item) => {
    try {
      const detail = await getLetter(item.id);
      setSelected(detail);
      // 읽음 처리 후 목록 업데이트
      setLetters((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, isRead: true } : l))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="letter-layout">
      <SidebarLeft />

      <main className="letter-main">
        <h2 className="letter-page-title">편지함</h2>
        <p className="letter-page-desc">
          AI 캐릭터가 보낸 일기 답장과 주간 리포트를 확인하세요.
        </p>

        {loading ? (
          <p style={{ color: '#9a9080', textAlign: 'center', paddingTop: 60 }}>불러오는 중…</p>
        ) : letters.length === 0 ? (
          <div className="letter-empty">
            <div className="letter-empty-icon">💌</div>
            <p className="letter-empty-text">아직 도착한 편지가 없어요.<br />일기를 작성하면 다음 날 답장이 와요!</p>
          </div>
        ) : (
          <div className="letter-list">
            {letters.map((item) => (
              <div
                key={item.id}
                className={`letter-item ${!item.isRead ? 'unread' : ''}`}
                onClick={() => handleOpen(item)}
              >
                <span className="letter-icon">{TYPE_ICON[item.type] ?? '✉️'}</span>
                <div className="letter-item-body">
                  <div className="letter-item-type">{TYPE_LABEL[item.type] ?? item.type}</div>
                  <div className="letter-item-date">{formatDate(item.deliverAt)}</div>
                </div>
                {!item.isRead && <span className="letter-item-badge">NEW</span>}
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className="letter-detail-overlay" onClick={() => setSelected(null)}>
          <div className="letter-detail-box" onClick={(e) => e.stopPropagation()}>
            <button className="letter-detail-close" onClick={() => setSelected(null)}>×</button>
            <div className="letter-detail-deco">✦ emolens ✦</div>
            <div className="letter-detail-type">{TYPE_LABEL[selected.type] ?? selected.type}</div>
            <div className="letter-detail-content">{selected.content}</div>
            <div className="letter-detail-date">{formatDate(selected.deliverAt)}</div>
            {selected.diaryId && (
              <button
                style={{ marginTop: 20, fontSize: 13, color: '#7c6fcd', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => { setSelected(null); navigate(`/diary/${selected.diaryId}`); }}
              >
                원본 일기 보기 →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
