import { useNavigate, useLocation } from 'react-router-dom';
import "@/styles/Sidebar-left/SidebarLeft.css";

const menuItems = [
  { label: '홈',         icon: '🏠', route: '/'        },
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
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

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
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SidebarLeft;
