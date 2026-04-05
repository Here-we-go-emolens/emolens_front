import { useNavigate } from 'react-router-dom';
import '@/styles/Login/LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  // 실제 연동 시 각 provider의 OAuth URL로 교체
  const handleSocialLogin = (provider) => {
    console.log(`${provider} 로그인 시도`);
    // TODO: OAuth 연동
    navigate('/home');
  };

  return (
    <div className="login-root">

      {/* 배경 글로우 */}
      <div className="login-glow glow-a" />
      <div className="login-glow glow-b" />

      <div className="login-card">

        {/* 로고 */}
        <div className="login-logo-wrap">
          <div className="login-logo-icon">🌿</div>
          <span className="login-logo-text">EmoLens</span>
        </div>

        {/* 상단 카피 */}
        <h1 className="login-title">오늘 하루, 어떠셨나요?</h1>
        <p className="login-desc">
          로그인하고 당신의 감정을<br />
          기록하고 이해해보세요
        </p>

        {/* 소셜 로그인 버튼 */}
        <div className="login-buttons">

          {/* 카카오 */}
          <button
            className="social-btn kakao"
            onClick={() => handleSocialLogin('kakao')}
          >
            <span className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3C6.477 3 2 6.701 2 11.25c0 2.944 1.832 5.52 4.591 7.02l-.945 3.506a.375.375 0 00.548.41L10.59 19.7C11.052 19.762 11.523 19.8 12 19.8c5.523 0 10-3.701 10-8.25C22 6.701 17.523 3 12 3z"
                  fill="#3A1D1D"
                />
              </svg>
            </span>
            <span className="social-label">카카오로 시작하기</span>
          </button>

          {/* 네이버 */}
          <button
            className="social-btn naver"
            onClick={() => handleSocialLogin('naver')}
          >
            <span className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13.56 12.27L10.2 7H7v10h3.44l3.36-5.27V17H17V7h-3.44z"
                  fill="white"
                />
              </svg>
            </span>
            <span className="social-label">네이버로 시작하기</span>
          </button>

          {/* 구글 */}
          <button
            className="social-btn google"
            onClick={() => handleSocialLogin('google')}
          >
            <span className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </span>
            <span className="social-label">Google로 시작하기</span>
          </button>

        </div>

        {/* 구분선 */}
        <div className="login-divider">
          <span>처음이신가요?</span>
        </div>

        {/* 랜딩 페이지로 */}
        <button className="login-back-btn" onClick={() => navigate('/')}>
          서비스 소개 보기
        </button>

        {/* 안내 문구 */}
        <p className="login-fine">
          로그인하면 <span>이용약관</span> 및 <span>개인정보 처리방침</span>에 동의하는 것으로 간주됩니다.
        </p>

      </div>
    </div>
  );
}
