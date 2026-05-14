import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '@/services/notificationApi';
import '@/styles/Notifications/NotificationsPage.css';

const TYPE_META = {
  ANALYSIS: { icon: '📊', bg: '#E8F5E9', accent: '#2E7D32', label: '분석완료' },
  WEEKLY:   { icon: '📋', bg: '#EEF4FF', accent: '#3B5BDB', label: '주간리포트' },
  LETTER:   { icon: '💌', bg: '#FFF3E0', accent: '#f26a21', label: '편지' },
  FRIEND:   { icon: '👥', bg: '#F3E5F5', accent: '#7B2D8B', label: '친구' },
};

const TABS = [
  { key: 'ALL',      label: '전체',     icon: '🔔' },
  { key: 'ANALYSIS', label: '분석완료', icon: '📊' },
  { key: 'WEEKLY',   label: '주간리포트', icon: '📋' },
  { key: 'LETTER',   label: '편지',     icon: '💌' },
];

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d === 1) return '어제';
  if (d < 7)  return `${d}일 전`;
  return new Date(isoStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

function groupByDate(list) {
  const groups = [];
  const seen = {};
  list.forEach(n => {
    const d = Math.floor((Date.now() - new Date(n.createdAt).getTime()) / 86400000);
    const key = d === 0 ? '오늘' : d === 1 ? '어제' : `${d}일 전`;
    if (!seen[key]) { seen[key] = true; groups.push({ label: key, items: [] }); }
    groups[groups.length - 1].items.push(n);
  });
  return groups;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  const load = () => getNotifications().then(setNotifications).catch(() => {});
  useEffect(() => { load(); }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filtered = activeTab === 'ALL'
    ? notifications
    : notifications.filter(n => n.type === activeTab);
  const grouped = groupByDate(filtered);

  const handleClick = async (n) => {
    if (!n.isRead) { await markAsRead(n.id); load(); }
    if (n.link) navigate(n.link);
  };

  return (
    <div className="noti-layout">
      <SidebarLeft />
      <main className="noti-main">

        {/* 상단 헤더 */}
        <div className="noti-header">
          <div>
            <h1 className="noti-title">알림</h1>
            <p className="noti-subtitle">
              {unreadCount > 0
                ? `읽지 않은 알림 ${unreadCount}개가 있어요`
                : '모든 알림을 확인했어요'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="noti-read-all-btn" onClick={async () => { await markAllAsRead(); load(); }}>
              모두 읽음
            </button>
          )}
        </div>

        {/* 안읽음 요약 배너 */}
        {unreadCount > 0 && (
          <div className="noti-banner">
            <div className="noti-banner-left">
              <span className="noti-banner-icon">🔔</span>
              <div>
                <p className="noti-banner-title">새 알림 {unreadCount}개</p>
                <p className="noti-banner-sub">확인하지 않은 알림이 있어요</p>
              </div>
            </div>
            <button className="noti-banner-btn" onClick={async () => { await markAllAsRead(); load(); }}>
              모두 읽음
            </button>
          </div>
        )}

        {/* 탭 */}
        <div className="noti-tabs">
          {TABS.map(tab => {
            const cnt = tab.key === 'ALL'
              ? unreadCount
              : notifications.filter(n => n.type === tab.key && !n.isRead).length;
            return (
              <button
                key={tab.key}
                className={`noti-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="noti-tab-icon">{tab.icon}</span>
                {tab.label}
                {cnt > 0 && <span className="noti-tab-badge">{cnt}</span>}
              </button>
            );
          })}
        </div>

        {/* 리스트 */}
        {grouped.length === 0 ? (
          <div className="noti-empty">
            <div className="noti-empty-circle">🔕</div>
            <p className="noti-empty-title">알림이 없어요</p>
            <p className="noti-empty-sub">새로운 소식이 오면 알려드릴게요</p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.label} className="noti-group">
              <div className="noti-group-label">
                <span>{group.label}</span>
                <div className="noti-group-line" />
              </div>
              {group.items.map(n => {
                const meta = TYPE_META[n.type] ?? TYPE_META.FRIEND;
                return (
                  <div
                    key={n.id}
                    className={`noti-item ${!n.isRead ? 'unread' : ''}`}
                    onClick={() => handleClick(n)}
                    style={{ '--accent': meta.accent }}
                  >
                    <div className="noti-icon-wrap" style={{ background: meta.bg }}>
                      <span>{meta.icon}</span>
                    </div>
                    <div className="noti-content">
                      <div className="noti-item-top">
                        <span className="noti-type-badge" style={{ background: meta.bg, color: meta.accent }}>
                          {meta.label}
                        </span>
                        <span className="noti-item-time">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="noti-item-title">{n.title}</p>
                      <p className="noti-item-body">{n.body}</p>
                    </div>
                    <div className="noti-item-right">
                      {!n.isRead && <span className="noti-dot" />}
                      <span className="noti-arrow">›</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

      </main>
    </div>
  );
}
