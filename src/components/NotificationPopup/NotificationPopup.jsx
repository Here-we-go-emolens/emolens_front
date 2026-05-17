import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '@/services/notificationApi';
import { getLetters, getLetter } from '@/services/letterApi';
import './NotificationPopup.css';

const NOTI_META = {
  ANALYSIS:      { icon: '📊', bg: '#E8F5E9', accent: '#2E7D32', label: '분석완료' },
  WEEKLY:        { icon: '📋', bg: '#EEF4FF', accent: '#3B5BDB', label: '주간리포트' },
  LETTER:        { icon: '💌', bg: '#FFF3E0', accent: '#f26a21', label: '편지' },
  DAILY_REMINDER:{ icon: '✏️', bg: '#FFF8F0', accent: '#f26a21', label: '일기 알림' },
};

const LETTER_TYPE_LABEL = {
  DIARY_REPLY:   '일기 답장',
  WEEKLY_REPORT: '주간 리포트',
};

const TABS = [
  { key: 'ALL',      label: '전체' },
  { key: 'LETTER',   label: '편지 💌' },
  { key: 'ANALYSIS', label: '분석완료 📊' },
  { key: 'WEEKLY',   label: '주간리포트 📋' },
];

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d === 1) return '어제';
  return `${d}일 전`;
}

function letterToItem(l) {
  return {
    id: `letter-${l.id}`,
    letterId: l.id,
    type: 'LETTER',
    title: LETTER_TYPE_LABEL[l.type] ?? '편지',
    body: l.diaryTitle ? `"${l.diaryTitle}"에 대한 답장이 도착했어요` : '새 편지를 확인해보세요',
    createdAt: l.deliverAt,
    isRead: l.isRead,
    link: '/letters',
  };
}

export default function NotificationPopup({ onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [letters, setLetters]             = useState([]);
  const [activeTab, setActiveTab]         = useState('ALL');
  const popupRef = useRef(null);

  const load = useCallback(() => {
    getNotifications().then(setNotifications).catch(() => {});
    getLetters().then(setLetters).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const letterItems = letters.map(letterToItem);
  const allItems = [
    ...letterItems,
    ...notifications,
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = (() => {
    if (activeTab === 'ALL')    return allItems;
    if (activeTab === 'LETTER') return letterItems;
    return notifications.filter(n => n.type === activeTab);
  })();

  const unreadLetters = letters.filter(l => !l.isRead).length;
  const unreadNotis   = notifications.filter(n => !n.isRead).length;
  const totalUnread   = unreadLetters + unreadNotis;

  const tabUnread = (key) => {
    if (key === 'ALL')    return totalUnread;
    if (key === 'LETTER') return unreadLetters;
    return notifications.filter(n => n.type === key && !n.isRead).length;
  };

  const handleClick = async (item) => {
    if (item.letterId) {
      if (!item.isRead) {
        await getLetter(item.letterId).catch(() => {});
        setLetters(prev => prev.map(l => l.id === item.letterId ? { ...l, isRead: true } : l));
        window.dispatchEvent(new CustomEvent('letter-read'));
      }
    } else if (!item.isRead) {
      await markAsRead(item.id).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    }
    if (item.link) { onClose(); navigate(item.link); }
  };

  const handleMarkAll = async () => {
    await markAllAsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setLetters(prev => prev.map(l => ({ ...l, isRead: true })));
  };

  return createPortal(
    <div className="noti-popup" ref={popupRef}>
      {/* 헤더 */}
      <div className="noti-popup-header">
        <div className="noti-popup-header-left">
          <span className="noti-popup-title">알림 · 편지함</span>
          {totalUnread > 0 && (
            <span className="noti-popup-unread-badge">{totalUnread}</span>
          )}
        </div>
        <div className="noti-popup-header-right">
          {totalUnread > 0 && (
            <button className="noti-popup-read-all" onClick={handleMarkAll}>
              모두 읽음
            </button>
          )}
          <button className="noti-popup-close" onClick={onClose}>×</button>
        </div>
      </div>

      {/* 탭 */}
      <div className="noti-popup-tabs">
        {TABS.map(tab => {
          const cnt = tabUnread(tab.key);
          return (
            <button
              key={tab.key}
              className={`noti-popup-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {cnt > 0 && <span className="noti-popup-tab-badge">{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* 리스트 */}
      <div className="noti-popup-list">
        {filtered.length === 0 ? (
          <div className="noti-popup-empty">
            <span>🔕</span>
            <p>알림이 없어요</p>
          </div>
        ) : filtered.map(item => {
          const meta = NOTI_META[item.type] ?? NOTI_META.ANALYSIS;
          return (
            <div
              key={item.id}
              className={`noti-popup-item ${!item.isRead ? 'unread' : ''}`}
              onClick={() => handleClick(item)}
            >
              <div className="noti-popup-icon" style={{ background: meta.bg }}>
                {meta.icon}
              </div>
              <div className="noti-popup-content">
                <div className="noti-popup-item-top">
                  <span className="noti-popup-type" style={{ color: meta.accent }}>{meta.label}</span>
                  <span className="noti-popup-time">{timeAgo(item.createdAt)}</span>
                </div>
                <p className="noti-popup-item-title">{item.title}</p>
                <p className="noti-popup-item-body">{item.body}</p>
              </div>
              {!item.isRead && <span className="noti-popup-dot" />}
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
}
