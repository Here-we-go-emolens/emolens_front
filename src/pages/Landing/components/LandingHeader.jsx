import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ backgroundColor: '#FDF6EF' }} className="sticky top-0 z-50 border-b border-orange-100/60">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: '#E8834A' }}
          >
            E
          </div>
          <span className="text-lg font-semibold" style={{ color: '#3D1F0F', letterSpacing: '-0.03em' }}>
            emolens
          </span>
        </div>

        {/* 데스크톱 네비 */}
        <nav className="hidden md:flex items-center gap-8">
          {['기능 소개', '미리보기', '가격 안내'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm transition-colors"
              style={{ color: '#8B6348' }}
              onMouseEnter={e => e.target.style.color = '#E8834A'}
              onMouseLeave={e => e.target.style.color = '#8B6348'}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-2 rounded-full transition-colors"
            style={{ color: '#8B6348' }}
          >
            로그인
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all"
            style={{ backgroundColor: '#E8834A' }}
          >
            시작하기
          </Link>
        </div>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="w-5 h-0.5 mb-1.5 rounded" style={{ backgroundColor: '#3D1F0F' }} />
          <div className="w-5 h-0.5 mb-1.5 rounded" style={{ backgroundColor: '#3D1F0F' }} />
          <div className="w-5 h-0.5 rounded" style={{ backgroundColor: '#3D1F0F' }} />
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3" style={{ backgroundColor: '#FDF6EF' }}>
          {['기능 소개', '미리보기', '가격 안내'].map((item) => (
            <a key={item} href="#" className="text-sm py-1" style={{ color: '#8B6348' }}>
              {item}
            </a>
          ))}
          <Link
            to="/login"
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-white text-center mt-2"
            style={{ backgroundColor: '#E8834A' }}
          >
            시작하기
          </Link>
        </div>
      )}
    </header>
  );
}
