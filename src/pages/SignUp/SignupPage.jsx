import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '@/services/userApi';
import '@/styles/Signup/SignupPage.css';

// TODO: 백엔드 닉네임 저장 API 완성 시 아래 주석 해제
// import { getAccessToken } from '@/services/auth';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SignupPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getMe().then((user) => setUserId(user.id)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 12) {
      setError('닉네임은 2~12자로 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: 백엔드 API 완성 시 실제 요청으로 교체
      // const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${getAccessToken()}`,
      //   },
      //   body: JSON.stringify({ nickname: trimmed }),
      // });
      // if (!res.ok) throw new Error('프로필 설정에 실패했습니다.');

      if (userId) localStorage.setItem(`emolens_signup_done_${userId}`, 'true');
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (userId) localStorage.setItem(`emolens_signup_done_${userId}`, 'true');
    navigate('/home', { replace: true });
  };

  return (
    <div className="signup-root">
      <div className="signup-glow signup-glow-a" />
      <div className="signup-glow signup-glow-b" />

      <div className="signup-card">
        <div className="signup-logo-wrap">
          <div className="signup-logo-icon">🌿</div>
          <span className="signup-logo-text">EmoLens</span>
        </div>

        <span className="signup-step-badge">프로필 설정</span>
        <h1 className="signup-title">거의 다 왔어요!</h1>
        <p className="signup-desc">
          EmoLens에서 사용할 닉네임을<br />
          알려주세요.
        </p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-field">
            <label className="signup-label" htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              className="signup-input"
              type="text"
              placeholder="예: 감성이, 하루봄 …"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={12}
              autoFocus
            />
            <p className="signup-input-hint">2~12자, 언제든지 변경할 수 있어요.</p>
          </div>

          {error && <p className="signup-error">{error}</p>}

          <button
            type="submit"
            className="signup-submit-btn"
            disabled={loading || !nickname.trim()}
          >
            {loading ? '저장 중…' : 'EmoLens 시작하기'}
          </button>

          <button
            type="button"
            className="signup-skip-btn"
            onClick={handleSkip}
          >
            나중에 설정하기
          </button>
        </form>
      </div>
    </div>
  );
}
