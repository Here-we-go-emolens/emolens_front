import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import { getLetters, getLetter, devDeliverPendingLetters } from '@/services/letterApi';
import mascotImg from '@/assets/mascot-removebg-preview.png';
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
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

function LetterCard({ item, onOpen }) {
  return (
    <div
      className={`letter-item ${!item.isRead ? 'unread' : 'read'}`}
      onClick={() => onOpen(item)}
    >
      {!item.isRead && <div className="letter-read-indicator" />}
      <div className={`letter-icon-wrap ${!item.isRead ? 'unread' : 'read'}`}>
        <span className="letter-icon">{TYPE_ICON[item.type] ?? '✉️'}</span>
      </div>
      <div className="letter-item-body">
        <div className="letter-item-top">
          <span className="letter-item-type">{TYPE_LABEL[item.type] ?? item.type}</span>
          {!item.isRead && <span className="letter-item-badge">NEW</span>}
        </div>
        {item.diaryTitle && (
          <div className="letter-item-diary-title">"{item.diaryTitle}"</div>
        )}
        <div className="letter-item-date">{formatDate(item.deliverAt)} 도착</div>
      </div>
      <span className="letter-item-arrow">{!item.isRead ? '→' : '›'}</span>
    </div>
  );
}

function LetterDetail({ letter, onClose, onViewDiary }) {
  const navigate = useNavigate();
  const [typedContent, setTypedContent] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    setTypedContent('');
    setTyping(true);
    let i = 0;
    const full = letter.content ?? '';
    const timer = setInterval(() => {
      i++;
      setTypedContent(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer);
        setTyping(false);
      }
    }, 10);
    return () => clearInterval(timer);
  }, [letter.content]);

  const skipTyping = () => {
    setTypedContent(letter.content ?? '');
    setTyping(false);
  };

  return (
    <div className="ld-overlay" onClick={onClose}>
      <div className="ld-wrap" onClick={(e) => e.stopPropagation()}>

        {/* 마스코트 */}
        <div className="ld-mascot-wrap">
          <img src={mascotImg} alt="" className="ld-mascot" />
        </div>

        {/* 편지 카드 (말풍선) */}
        <div className="ld-bubble">
          <div className="ld-bubble-arrow" />

          <button className="ld-close" onClick={onClose}>×</button>

          <div className="ld-deco">✦ emolens ✦</div>
          <div className="ld-type">{TYPE_LABEL[letter.type] ?? letter.type}</div>

          <div
            className="ld-content"
            onClick={typing ? skipTyping : undefined}
            style={{ cursor: typing ? 'pointer' : 'default' }}
          >
            {typedContent}
            {typing && <span className="ld-cursor" />}
            {typing && (
              <p className="ld-skip-hint">클릭하면 바로 볼 수 있어요</p>
            )}
          </div>

          <div className="ld-footer">
            <span className="ld-date">{formatDate(letter.deliverAt)}</span>
            {letter.diaryId && (
              <button className="ld-diary-link" onClick={onViewDiary}>
                원본 일기 보기 →
              </button>
            )}
          </div>

          {!typing && (
            <button
              className="ld-cta-btn"
              onClick={() => { onClose(); navigate('/weekly-report'); }}
            >
              이번 주 감정 흐름 보기 →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function LetterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [letters, setLetters]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [delivering, setDelivering] = useState(false);

  const handleDevDeliver = async () => {
    setDelivering(true);
    try {
      const msg = await devDeliverPendingLetters();
      const data = await getLetters();
      setLetters(data);
      showToast(msg, 'success');
    } catch (e) {
      showToast('배달 실패: ' + e.message, 'error');
    } finally {
      setDelivering(false);
    }
  };

  const handleOpen = async (item) => {
    try {
      const wasUnread = !item.isRead;
      const detail = await getLetter(item.id);
      setSelected(detail);
      setLetters((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, isRead: true } : l))
      );
      if (wasUnread) window.dispatchEvent(new CustomEvent('letter-read'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getLetters()
      .then((data) => {
        setLetters(data);
        const openId = location.state?.openLetterId;
        if (openId) {
          const target = data.find((l) => l.id === openId);
          if (target) handleOpen(target);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="letter-layout">
      <SidebarLeft />

      <main className="letter-main">
        <h2 className="letter-page-title">편지함</h2>
        <p className="letter-page-desc">
          AI 캐릭터가 보낸 일기 답장과 주간 리포트를 확인하세요.
        </p>

        {import.meta.env.DEV && (
          <button
            onClick={handleDevDeliver}
            disabled={delivering}
            style={{
              marginBottom: '16px',
              padding: '8px 16px',
              background: '#f26a21',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: delivering ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              opacity: delivering ? 0.6 : 1,
            }}
          >
            {delivering ? '배달 중…' : '편지 즉시 배달 (DEV)'}
          </button>
        )}

        {loading ? (
          <p className="letter-loading">불러오는 중…</p>
        ) : letters.length === 0 ? (
          <div className="letter-empty">
            <img src={mascotImg} alt="" className="letter-empty-mascot" />
            <p className="letter-empty-text">
              아직 도착한 편지가 없어요.<br />
              일기를 작성하면 다음 날 답장이 와요!
            </p>
          </div>
        ) : (() => {
            const unread = letters.filter(l => !l.isRead);
            const read   = letters.filter(l =>  l.isRead);
            return (
              <div className="letter-sections">
                {unread.length > 0 && (
                  <div className="letter-section">
                    <div className="letter-section-header">
                      <span className="letter-section-title">새 편지</span>
                      <span className="letter-section-count">{unread.length}</span>
                    </div>
                    <div className="letter-list">
                      {unread.map(item => <LetterCard key={item.id} item={item} onOpen={handleOpen} />)}
                    </div>
                  </div>
                )}
                {read.length > 0 && (
                  <div className="letter-section">
                    <div className="letter-section-header">
                      <span className="letter-section-title read">읽은 편지</span>
                    </div>
                    <div className="letter-list">
                      {read.map(item => <LetterCard key={item.id} item={item} onOpen={handleOpen} />)}
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        }
      </main>

      {selected && (
        <LetterDetail
          letter={selected}
          onClose={() => setSelected(null)}
          onViewDiary={() => { setSelected(null); navigate(`/diary/${selected.diaryId}`); }}
        />
      )}
    </div>
  );
}
