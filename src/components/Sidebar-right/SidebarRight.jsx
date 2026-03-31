import { useState } from 'react';
import "@/styles/Sidebar-right/SidebarRight.css";

const friends = [
  { id: 1, name: '구름위에서', tag: '#2847', emotion: '😊', emotionLabel: '행복', online: true },
  { id: 2, name: '별빛여행자', tag: '#1023', emotion: '😔', emotionLabel: '우울', online: false },
  { id: 3, name: '조용한숲',   tag: '#5531', emotion: '🥰', emotionLabel: '설렘', online: true },
  { id: 4, name: '파란하늘',   tag: '#7792', emotion: '😌', emotionLabel: '평온', online: true },
  { id: 5, name: '새벽달빛',   tag: '#3344', emotion: '😤', emotionLabel: '분노', online: false },
];

const FILTERS = ['프로필', '닉네임', '감정'];

const SidebarRight = () => {
  const [activeFilters, setActiveFilters] = useState(['프로필', '닉네임', '감정']);

  const toggle = (f) => {
    setActiveFilters(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const show = (f) => activeFilters.includes(f);

  return (
    <div className="sidebar-right">
      <h3 className="friends-title">친구창</h3>

      <div className="friend-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip ${show(f) ? 'on' : 'off'}`}
            onClick={() => toggle(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="friend-list">
        {friends.map(friend => (
          <div key={friend.id} className="friend-item">
            {show('프로필') && (
              <div className={`friend-avatar ${friend.online ? 'online' : ''}`}>
                {friend.emotion}
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
                <span className="friend-emotion-label">{friend.emotionLabel}</span>
              )}
            </div>
            <div className={`online-dot ${friend.online ? 'online' : 'offline'}`} />
          </div>
        ))}
      </div>

      <div className="friends-empty-hint">
        친구를 더 추가해보세요
      </div>
    </div>
  );
};

export default SidebarRight;
