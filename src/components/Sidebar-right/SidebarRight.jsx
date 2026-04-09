import { useState } from 'react';
import { useFriendRealtime } from '../../hooks/useFriendRealtime';
import "@/styles/Sidebar-right/SidebarRight.css";

const DISPLAY_FILTERS = ['프로필', '닉네임', '감정'];
const TABS = ['전체', '온라인', '새소식'];

const CONNECTION_LABELS = {
  connecting:   '연결 중',
  connected:    '실시간 연결됨',
  disconnected: '오프라인',
  reconnecting: '재연결 중',
};

const SidebarRight = () => {
  const [activeTab,      setActiveTab]      = useState('전체');
  const [displayFilters, setDisplayFilters] = useState(['프로필', '닉네임', '감정']);

  const {
    friends,
    connectionStatus,
    recentlyChanged,
    clearUnread,
    reconnect,
  } = useFriendRealtime({ mock: true });

  const toggleDisplay = (f) =>
    setDisplayFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  const show = (f) => displayFilters.includes(f);

  const totalUnread = friends.reduce((sum, f) => sum + (f.unreadCount || 0), 0);

  const filteredFriends = friends.filter((f) => {
    if (activeTab === '온라인') return f.status === 'online' || f.status === 'away';
    if (activeTab === '새소식') return (f.unreadCount || 0) > 0;
    return true;
  });

  const isLoading =
    connectionStatus === 'connecting' || connectionStatus === 'reconnecting';

  return (
    <div className="sidebar-right">

      {/* ── 헤더 ── */}
      <div className="friends-header">
        <h3 className="friends-title">친구창</h3>
        <div className={`connection-status cs-${connectionStatus}`}>
          <span className="connection-dot" />
          <span className="connection-text">{CONNECTION_LABELS[connectionStatus]}</span>
        </div>
      </div>

      {/* ── 탭 필터 (전체 / 온라인 / 새소식) ── */}
      <div className="friend-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`friend-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === '새소식' && totalUnread > 0 && (
              <span className="tab-unread-badge">{totalUnread}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── 표시 필터 (프로필 / 닉네임 / 감정) ── */}
      <div className="friend-filters">
        {DISPLAY_FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-chip ${show(f) ? 'on' : 'off'}`}
            onClick={() => toggleDisplay(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── 친구 목록 ── */}
      {isLoading ? (
        <div className="friend-list-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="friend-skeleton">
              <div className="skeleton-avatar" />
              <div className="skeleton-lines">
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="friend-list-empty">
          {activeTab === '온라인' && '온라인 친구가 없어요 😴'}
          {activeTab === '새소식' && '새로운 소식이 없어요 ✨'}
          {activeTab === '전체'   && '친구가 없어요'}
        </div>
      ) : (
        <div className="friend-list">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className={`friend-item${recentlyChanged.has(friend.id) ? ' highlighted' : ''}`}
              onClick={() => clearUnread(friend.id)}
            >
              {show('프로필') && (
                <div className="friend-avatar-wrap">
                  <div className="friend-avatar">{friend.emotion}</div>
                  <span className={`status-dot ${friend.status}`} />
                </div>
              )}

              <div className="friend-info">
                {show('닉네임') && (
                  <>
                    <span className="friend-name">{friend.name}</span>
                    <span className="friend-tag">{friend.tag}</span>
                  </>
                )}
                {show('감정') && (
                  <span className={`friend-emotion-label emotion-${friend.emotionColor ?? 'calm'}`}>
                    {friend.emotionLabel}
                  </span>
                )}
                <span className="friend-last-active">{friend.lastActive}</span>
              </div>

              {(friend.unreadCount || 0) > 0 && (
                <span className="unread-badge">{friend.unreadCount}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── 재연결 버튼 ── */}
      {connectionStatus === 'disconnected' && (
        <button className="reconnect-btn" onClick={reconnect}>
          🔄 재연결
        </button>
      )}

      <div className="friends-empty-hint">친구를 더 추가해보세요</div>
    </div>
  );
};

export default SidebarRight;
