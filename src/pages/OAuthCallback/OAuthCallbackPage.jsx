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

    console.log('[OAuthCallback] URL:', window.location.href);
    console.log('[OAuthCallback] accessToken:', accessToken ? '있음' : '없음');
    console.log('[OAuthCallback] refreshToken:', refreshToken ? '있음' : '없음');

    if (!accessToken || !refreshToken) {
      console.error('[OAuthCallback] 토큰이 URL에 없습니다.');
      setError('토큰을 받지 못했습니다. 다시 로그인해주세요.');
      return;
    }

    saveTokens(accessToken, refreshToken);
    console.log('[OAuthCallback] 토큰 저장 완료, /api/auth/me 호출 시작');

    const timeout = setTimeout(() => {
      console.error('[OAuthCallback] /api/auth/me 10초 초과');
      setError('/api/auth/me 응답 없음 (10초 초과). 서버를 확인해주세요.');
    }, 10000);

    getMe()
      .then((user) => {
        clearTimeout(timeout);
        console.log('[OAuthCallback] 유저 정보:', user);
        const signupKey = `emolens_signup_done_${user.id}`;
        const hasSignedUp = localStorage.getItem(signupKey) === 'true';
        const dest = hasSignedUp ? '/home' : '/signup';
        console.log('[OAuthCallback] 이동 대상:', dest);
        window.location.replace(dest);
      })
      .catch((err) => {
        clearTimeout(timeout);
        const msg = err?.response?.data?.message ?? err?.message ?? String(err);
        console.error('[OAuthCallback] /api/auth/me 실패:', msg, err);
        setError(`로그인 처리 실패: ${msg}`);
      });
  }, []);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px', padding: '24px' }}>
        <p style={{ color: '#e05c6a', textAlign: 'center', maxWidth: '400px' }}>{error}</p>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ffe0cc', background: '#fff', color: '#f26a21', fontWeight: 600 }}>
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>
      로그인 처리 중...
    </div>
  );
}
