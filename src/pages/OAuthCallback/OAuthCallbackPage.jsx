import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveTokens } from '@/services/auth';
import { getMe } from '@/services/userApi';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    console.log('[OAuthCallback] accessToken:', accessToken ? '있음' : '없음');
    console.log('[OAuthCallback] refreshToken:', refreshToken ? '있음' : '없음');

    if (!accessToken || !refreshToken) {
      console.error('[OAuthCallback] 토큰이 URL에 없습니다. 현재 URL:', window.location.href);
      setError('토큰을 받지 못했습니다. 다시 로그인해주세요.');
      return;
    }

    saveTokens(accessToken, refreshToken);
    console.log('[OAuthCallback] 토큰 저장 완료');

    getMe()
      .then((user) => {
        console.log('[OAuthCallback] 유저 정보:', user);
        const signupKey = `emolens_signup_done_${user.id}`;
        const hasSignedUp = localStorage.getItem(signupKey) === 'true';
        const dest = hasSignedUp ? '/home' : '/signup';
        console.log('[OAuthCallback] 이동 대상:', dest);
        window.location.replace(dest);
      })
      .catch((err) => {
        console.error('[OAuthCallback] /api/auth/me 실패:', err);
        window.location.replace('/home');
      });
  }, []);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <p style={{ color: '#e05c6a' }}>{error}</p>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9088a8' }}>
      로그인 처리 중...
    </div>
  );
}
