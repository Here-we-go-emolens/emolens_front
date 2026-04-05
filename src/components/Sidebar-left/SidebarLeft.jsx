import { useNavigate, useLocation } from 'react-router-dom';
import "@/styles/Sidebar-left/SidebarLeft.css";

// 무료 사용자 채팅 사용량 (실제 서비스에서는 전역 상태/API로 관리)
const CHAT_USED  = 7;
const CHAT_LIMIT = 10;

const menuItems = [
  { label: '홈',         icon: '🏠', route: '/home'     },
  { label: '일기 작성',   icon: '✏️', route: '/write'   },
  { label: '대화형 일기', icon: '🤖', route: '/ai-chat' },
  { label: '통계',       icon: '📊', route: '/stats'   },
  { label: '설정',       icon: '⚙️', route: '/settings' },
];

const SidebarLeft = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (route) => {
    if (!route) return false;
    if (route === '/home') return pathname === '/home';
    return pathname.startsWith(route);
  };

  const chatRemaining = CHAT_LIMIT - CHAT_USED;
  const chatWarning   = chatRemaining <= 3;

  return (
    <div className="sidebar-left">
      <div className="sidebar-profile">
        <div className="profile-img-wrap">
          <img
            className="profile-img"
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="profile"
          />
        </div>
        <div className="profile-name">달빛소녀</div>
        <div className="profile-tag">#1234</div>
        {/* 플랜 배지 */}
        <div className="plan-badge free-badge">Free 플랜</div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.label}
            className={`nav-item ${isActive(item.route) ? 'active' : ''}`}
            onClick={() => item.route && navigate(item.route)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.route === '/ai-chat' && (
              <span className={`chat-badge ${chatWarning ? 'warn' : ''}`}>
                {CHAT_USED}/{CHAT_LIMIT}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Premium 업그레이드 배너 */}
      <div className="sidebar-premium-cta" onClick={() => navigate('/premium')}>
        <span className="sidebar-premium-icon">✨</span>
        <div className="sidebar-premium-text">
          <span className="sidebar-premium-title">Premium 업그레이드</span>
          <span className="sidebar-premium-desc">감정 그래프·리포트 해제</span>
        </div>
      </div>
    </div>
  );
};

export default SidebarLeft;
