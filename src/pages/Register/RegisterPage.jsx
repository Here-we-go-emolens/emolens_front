import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/Register/RegisterPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const next = {};
    const name = form.name.trim();
    if (!name) next.name = '닉네임을 입력해주세요.';
    else if (name.length < 2 || name.length > 20) next.name = '닉네임은 2~20자로 입력해주세요.';

    if (!form.email) next.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = '올바른 이메일 형식이 아닙니다.';

    if (!form.password) next.password = '비밀번호를 입력해주세요.';
    else if (form.password.length < 8) next.password = '비밀번호는 8자 이상이어야 합니다.';

    if (!form.confirm) next.confirm = '비밀번호 확인을 입력해주세요.';
    else if (form.password !== form.confirm) next.confirm = '비밀번호가 일치하지 않습니다.';

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setServerError('이미 사용 중인 이메일입니다.');
        } else {
          setServerError(data.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
        }
        return;
      }

      navigate('/login', { state: { registered: true }, replace: true });
    } catch {
      setServerError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-root">
      <div className="register-glow register-glow-a" />
      <div className="register-glow register-glow-b" />

      <div className="register-card">
        <div className="register-logo-wrap">
          <div className="register-logo-icon">🌿</div>
          <span className="register-logo-text">EmoLens</span>
        </div>

        <h1 className="register-title">함께 시작해요</h1>
        <p className="register-desc">
          이메일로 EmoLens 계정을<br />
          만들어보세요.
        </p>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="register-field">
            <label className="register-label" htmlFor="name">닉네임</label>
            <input
              id="name"
              name="name"
              type="text"
              className={`register-input${errors.name ? ' register-input--error' : ''}`}
              placeholder="2~20자로 입력해주세요"
              value={form.name}
              onChange={handleChange}
              autoComplete="nickname"
              autoFocus
              maxLength={20}
            />
            {errors.name && <p className="register-field-error">{errors.name}</p>}
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="email">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`register-input${errors.email ? ' register-input--error' : ''}`}
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <p className="register-field-error">{errors.email}</p>}
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`register-input${errors.password ? ' register-input--error' : ''}`}
              placeholder="8자 이상 입력해주세요"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <p className="register-field-error">{errors.password}</p>}
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="confirm">비밀번호 확인</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              className={`register-input${errors.confirm ? ' register-input--error' : ''}`}
              placeholder="비밀번호를 다시 입력해주세요"
              value={form.confirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirm && <p className="register-field-error">{errors.confirm}</p>}
          </div>

          {serverError && <p className="register-server-error">{serverError}</p>}

          <button type="submit" className="register-submit-btn" disabled={loading}>
            {loading ? '가입 중…' : '회원가입'}
          </button>
        </form>

        <div className="register-divider"><span>이미 계정이 있으신가요?</span></div>

        <button className="register-login-btn" onClick={() => navigate('/login')}>
          로그인하기
        </button>
      </div>
    </div>
  );
}
