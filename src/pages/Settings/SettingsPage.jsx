import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import { useUserContext } from '@/contexts/UserContext';
import { logout, updateProfile, uploadProfileImage, changePassword, withdraw, getNotificationSettings, updateNotificationSettings } from '@/services/userApi';
import { clearTokens } from '@/services/auth';
import { getMyCharacter } from '@/services/characterApi';
import '@/styles/Settings/SettingsPage.css';

const DEFAULT_PROFILE_IMAGE = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
const resolveImageUrl = (url) => {
  if (!url) return DEFAULT_PROFILE_IMAGE;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_BASE_URL}${url}`;
};

/* ── 기본값 ───────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  profile: {
    nickname: '',
    bio: '',
    email: '',
  },
  notifications: {
    dailyReminder: true,
    aiAnalysisDone: true,
    weeklyReport: false,
    friendActivity: false,
  },
  writing: {
    defaultMode: 'normal', // 'normal' | 'ai'
    fontSize: 'medium',    // 'small' | 'medium' | 'large'
    autoSave: true,
  },
  ai: {
    emotionKeywords: true,
    actionRecommend: true,
    weeklySummary: false,
    patternAnalysis: true,
  },
  privacy: {
    privateDiary: true,
    shareEmotionWithFriends: false,
    publicProfile: false,
    saveAnalysisData: true,
  },
};

/* ── 토글 스위치 ────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    className={`toggle-switch ${checked ? 'on' : 'off'} ${disabled ? 'disabled' : ''}`}
    onClick={() => !disabled && onChange(!checked)}
    aria-pressed={checked}
  >
    <span className="toggle-thumb" />
  </button>
);

/* ── 설정 섹션 래퍼 ─────────────────────────────────── */
const SettingSection = ({ icon, title, subtitle, children }) => (
  <div className="setting-section">
    <div className="section-header">
      <span className="section-icon">{icon}</span>
      <div>
        <h3 className="section-title">{title}</h3>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
    </div>
    <div className="section-body">{children}</div>
  </div>
);

/* ── 토글 행 ─────────────────────────────────────────── */
const ToggleRow = ({ label, desc, checked, onChange }) => (
  <div className="toggle-row">
    <div className="toggle-info">
      <span className="toggle-label">{label}</span>
      {desc && <span className="toggle-desc">{desc}</span>}
    </div>
    <ToggleSwitch checked={checked} onChange={onChange} />
  </div>
);

/* ── 오른쪽 패널 ────────────────────────────────────── */
const RightPanel = ({ settings, profileImageUrl }) => {
  const { profile, notifications, writing, ai } = settings;
  const notifOn = Object.values(notifications).some(Boolean);
  const aiOn    = Object.values(ai).some(Boolean);

  return (
    <aside className="right-panel">
      {/* 프로필 미리보기 */}
      <div className="rp-card rp-profile">
        <div className="rp-card-label">프로필 미리보기</div>
        <div className="rp-avatar">
          <img src={resolveImageUrl(profileImageUrl)} alt="profile" />
        </div>
        <div className="rp-nickname">{profile.nickname || '닉네임 없음'}</div>
        <div className="rp-bio">{profile.bio || '한 줄 소개를 입력해주세요.'}</div>
      </div>

      {/* 설정 요약 */}
      <div className="rp-card">
        <div className="rp-card-label">현재 설정 요약</div>
        <ul className="rp-summary-list">
          <li>
            <span className="rp-sum-key">✏️ 기본 작성 모드</span>
            <span className="rp-sum-val">
              {writing.defaultMode === 'normal' ? '일반 일기' : 'AI 대화형'}
            </span>
          </li>
          <li>
            <span className="rp-sum-key">🔔 알림</span>
            <span className={`rp-sum-val ${notifOn ? 'val-on' : 'val-off'}`}>
              {notifOn ? '켜짐' : '꺼짐'}
            </span>
          </li>
          <li>
            <span className="rp-sum-key">🤖 AI 분석</span>
            <span className={`rp-sum-val ${aiOn ? 'val-on' : 'val-off'}`}>
              {aiOn ? '사용 중' : '사용 안 함'}
            </span>
          </li>
          <li>
            <span className="rp-sum-key">🔒 공개 범위</span>
            <span className="rp-sum-val">
              {settings.privacy.privateDiary ? '비공개' : '공개'}
            </span>
          </li>
          <li>
            <span className="rp-sum-key">🔡 글자 크기</span>
            <span className="rp-sum-val">
              {{ small: '작게', medium: '보통', large: '크게' }[writing.fontSize]}
            </span>
          </li>
        </ul>
      </div>

      {/* 안내 카드 */}
      <div className="rp-card rp-tip">
        <div className="rp-card-label">💡 안내</div>
        <ul className="rp-tip-list">
          <li>설정을 변경하면 기록 경험이 더 나에게 맞게 조정됩니다.</li>
          <li>AI 분석 기능은 언제든 켜고 끌 수 있습니다.</li>
          <li>비밀번호는 보안을 위해 주기적으로 변경해 주세요.</li>
        </ul>
      </div>
    </aside>
  );
};

/* ════════════════════════════════════════════════════════
   메인 컴포넌트
═══════════════════════════════════════════════════════ */
const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [character, setCharacter] = useState(null);
  const [profileDraft, setProfileDraft] = useState({ ...DEFAULT_SETTINGS.profile });
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getMyCharacter().then(setCharacter).catch(() => {});
    getNotificationSettings()
      .then(ns => setSettings(prev => ({ ...prev, notifications: ns })))
      .catch(() => {}); // 백엔드 미구현 시 기본값 유지
  }, []);

  useEffect(() => {
    if (!user) return;
    const profile = {
      nickname: user.name  ?? '',
      bio:      user.bio   ?? '',
      email:    user.email?.endsWith('@social.local') ? '' : (user.email ?? ''),
    };
    setSettings(prev => ({ ...prev, profile }));
    setProfileDraft(profile);
    setProfileImageUrl(user.profileImageUrl ?? null);
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  /* 중첩 상태 업데이트 헬퍼 */
  const setNested = (section, key, value) =>
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));

  /* 사진 변경 - 업로드 즉시 저장 */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadProfileImage(file);
      setProfileImageUrl(url);
      await updateProfile({ name: profileDraft.nickname || user?.name, profileImageUrl: url });
      setUser(prev => ({ ...prev, profileImageUrl: url }));
      showToast('프로필 사진이 변경됐습니다.');
    } catch {
      showToast('사진 업로드에 실패했습니다.', 'error');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  /* 프로필 저장 */
  const handleProfileSave = async () => {
    if (!profileDraft.nickname.trim()) {
      showToast('닉네임을 입력해주세요.', 'info');
      return;
    }
    try {
      await updateProfile({ name: profileDraft.nickname.trim(), profileImageUrl: profileImageUrl || null });
      setSettings(prev => ({ ...prev, profile: { ...profileDraft } }));
      setUser(prev => ({ ...prev, name: profileDraft.nickname.trim(), profileImageUrl }));
      showToast('프로필이 저장되었습니다.');
    } catch {
      showToast('프로필 저장에 실패했습니다.', 'error');
    }
  };

  /* 비밀번호 변경 */
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const handleChangePassword = async () => {
    setPwError('');
    if (pwForm.next.length < 8) { setPwError('새 비밀번호는 8자 이상이어야 해요.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('새 비밀번호가 일치하지 않아요.'); return; }
    try {
      await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      showToast('비밀번호가 변경되었습니다.');
      setShowPwForm(false);
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      setPwError(e?.response?.status === 401 ? '현재 비밀번호가 올바르지 않아요.' : '비밀번호 변경에 실패했습니다.');
    }
  };

  /* 회원탈퇴 */
  const handleWithdraw = async () => {
    if (!window.confirm('정말 탈퇴하시겠어요?\n모든 일기와 분석 데이터가 영구적으로 삭제됩니다.')) return;
    if (!window.confirm('다시 한번 확인합니다. 탈퇴하면 복구할 수 없어요.')) return;
    try {
      await withdraw();
      clearTokens();
      navigate('/login');
    } catch {
      showToast('탈퇴 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  /* 전체 저장 */
  const handleSaveAll = async () => {
    setSettings(prev => ({ ...prev, profile: { ...profileDraft } }));
    try {
      await updateNotificationSettings(settings.notifications);
      showToast('모든 설정이 저장되었습니다.');
    } catch {
      showToast('알림 설정 저장에 실패했습니다.', 'error');
    }
  };

  /* 초기화 */
  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setProfileDraft({ ...DEFAULT_SETTINGS.profile });
    showToast('기본값으로 초기화되었습니다.', 'info');
  };

  const { notifications, writing, ai, privacy } = settings;

  return (
    <div className="settings-layout">
      <SidebarLeft />

      {/* ── 가운데 메인 ────────────────────────────── */}
      <main className="settings-main">
        {/* 토스트 */}
        {toast && (
          <div className={`toast-msg ${toast.type}`}>
            {toast.type === 'success' ? '✓' : 'ℹ'} {toast.msg}
          </div>
        )}

        {/* 페이지 헤더 */}
        <div className="page-header">
          <h1 className="page-title">설정</h1>
          <p className="page-desc">나에게 맞는 기록 환경을 만들어보세요</p>
        </div>

        {/* ① 프로필 설정 */}
        <SettingSection
          icon="👤"
          title="프로필 설정"
          subtitle="나를 표현하는 정보를 관리하세요"
        >
          <div className="profile-edit-area">
            <div className="profile-avatar-edit">
              <img
                src={resolveImageUrl(profileImageUrl)}
                alt="profile"
                className="profile-edit-img"
              />
              <label className={`avatar-change-btn${imageUploading ? ' disabled' : ''}`}>
                {imageUploading ? '업로드 중...' : '사진 변경'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                  disabled={imageUploading}
                />
              </label>
            </div>
            <div className="profile-fields">
              <div className="field-group">
                <label className="field-label">닉네임</label>
                <input
                  className="field-input"
                  type="text"
                  value={profileDraft.nickname}
                  onChange={e =>
                    setProfileDraft(p => ({ ...p, nickname: e.target.value }))
                  }
                  placeholder="닉네임을 입력하세요"
                />
              </div>
              <div className="field-group">
                <label className="field-label">한 줄 소개</label>
                <input
                  className="field-input"
                  type="text"
                  value={profileDraft.bio}
                  onChange={e =>
                    setProfileDraft(p => ({ ...p, bio: e.target.value }))
                  }
                  placeholder="나를 소개해주세요"
                />
              </div>
              {profileDraft.email && (
                <div className="field-group">
                  <label className="field-label">이메일</label>
                  <input
                    className="field-input field-input-readonly"
                    type="email"
                    value={profileDraft.email}
                    readOnly
                  />
                </div>
              )}
              <button className="btn-primary" onClick={handleProfileSave}>
                프로필 저장
              </button>
            </div>
          </div>
        </SettingSection>

        {/* ② AI 캐릭터 설정 */}
        <SettingSection
          icon="🪄"
          title="AI 캐릭터 설정"
          subtitle="나의 감정 일기를 함께할 AI 캐릭터를 관리해요"
        >
          <div className="character-setting-card">
            <div className="character-setting-left">
              <div className="character-setting-orb">
                {character?.name?.[0] ?? '?'}
              </div>
              <div>
                <div className="character-setting-name">
                  {character ? character.name : '아직 캐릭터가 없어요'}
                </div>
                {character && (
                  <div className="character-setting-meta">
                    {character.tone === 'FRIENDLY_INFORMAL' || character.tone === 'PLAYFUL' ? '반말' : '존댓말'}
                    {' · '}
                    {{ EMPATHETIC: '공감형', POSITIVE: '긍정형', DIRECT: '직설형', PHILOSOPHICAL: '철학형' }[character.personality] ?? character.personality}
                  </div>
                )}
              </div>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/character')}>
              {character ? '수정하기' : '만들기'}
            </button>
          </div>
        </SettingSection>

        {/* ③ 알림 설정 */}
        <SettingSection
          icon="🔔"
          title="알림 설정"
          subtitle="원하는 알림만 골라서 받아보세요"
        >
          <ToggleRow
            label="매일 일기 작성 알림"
            desc="매일 저녁 일기 작성을 알려드립니다"
            checked={notifications.dailyReminder}
            onChange={v => setNested('notifications', 'dailyReminder', v)}
          />
          <ToggleRow
            label="AI 분석 완료 알림"
            desc="일기 분석이 완료되면 알려드립니다"
            checked={notifications.aiAnalysisDone}
            onChange={v => setNested('notifications', 'aiAnalysisDone', v)}
          />
          <ToggleRow
            label="주간 감정 리포트 알림"
            desc="매주 월요일 지난 주 감정 리포트를 발송합니다"
            checked={notifications.weeklyReport}
            onChange={v => setNested('notifications', 'weeklyReport', v)}
          />
          <ToggleRow
            label="친구 관련 알림"
            desc="친구의 반응이나 공유 활동을 알려드립니다"
            checked={notifications.friendActivity}
            onChange={v => setNested('notifications', 'friendActivity', v)}
          />
        </SettingSection>

        {/* ④ 일기 작성 환경 */}
        <SettingSection
          icon="✏️"
          title="일기 작성 환경 설정"
          subtitle="더 편안한 기록 환경을 설정하세요"
        >
          {/* 기본 작성 모드 */}
          <div className="sub-setting-group">
            <div className="sub-setting-label">기본 작성 모드</div>
            <div className="btn-group">
              {[
                { val: 'normal', label: '📝 일반 일기' },
                { val: 'ai',    label: '🤖 AI 대화형 일기' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  className={`btn-choice ${writing.defaultMode === val ? 'selected' : ''}`}
                  onClick={() => setNested('writing', 'defaultMode', val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 글자 크기 */}
          <div className="sub-setting-group">
            <div className="sub-setting-label">글자 크기</div>
            <div className="btn-group">
              {[
                { val: 'small',  label: '작게' },
                { val: 'medium', label: '보통' },
                { val: 'large',  label: '크게' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  className={`btn-choice ${writing.fontSize === val ? 'selected' : ''}`}
                  onClick={() => setNested('writing', 'fontSize', val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ToggleRow
            label="자동 임시저장"
            desc="작성 중인 일기를 30초마다 자동 저장합니다"
            checked={writing.autoSave}
            onChange={v => setNested('writing', 'autoSave', v)}
          />
                </SettingSection>

        {/* ⑤ AI 분석 설정 */}
        <SettingSection
          icon="🤖"
          title="AI 분석 설정"
          subtitle="나의 감정을 더 깊이 이해할 수 있도록 도와드려요"
        >
          <ToggleRow
            label="감정 키워드 분석"
            desc="일기 내용을 바탕으로 핵심 감정 키워드를 추출합니다"
            checked={ai.emotionKeywords}
            onChange={v => setNested('ai', 'emotionKeywords', v)}
          />
          <ToggleRow
            label="행동 추천 받기"
            desc="기록을 바탕으로 감정 관리 팁을 제안합니다"
            checked={ai.actionRecommend}
            onChange={v => setNested('ai', 'actionRecommend', v)}
          />
          <ToggleRow
            label="주간 감정 요약"
            desc="한 주간의 감정 흐름을 요약하여 제공합니다"
            checked={ai.weeklySummary}
            onChange={v => setNested('ai', 'weeklySummary', v)}
          />
          <ToggleRow
            label="감정 패턴 분석"
            desc="장기적인 감정 패턴을 분석하여 인사이트를 제공합니다"
            checked={ai.patternAnalysis}
            onChange={v => setNested('ai', 'patternAnalysis', v)}
          />
        </SettingSection>

        {/* ⑥ 개인정보 및 공개 범위 */}
        <SettingSection
          icon="🔒"
          title="개인정보 및 공개 범위"
          subtitle="나의 기록이 어떻게 공유될지 설정하세요"
        >
          <ToggleRow
            label="내 일기 비공개 유지"
            desc="모든 일기를 나만 볼 수 있게 설정합니다"
            checked={privacy.privateDiary}
            onChange={v => setNested('privacy', 'privateDiary', v)}
          />
          <ToggleRow
            label="친구에게 감정 상태 공개"
            desc="오늘의 감정 태그를 친구 피드에 표시합니다"
            checked={privacy.shareEmotionWithFriends}
            onChange={v => setNested('privacy', 'shareEmotionWithFriends', v)}
          />
          <ToggleRow
            label="프로필 공개"
            desc="다른 사용자에게 내 프로필이 노출됩니다"
            checked={privacy.publicProfile}
            onChange={v => setNested('privacy', 'publicProfile', v)}
          />
          <ToggleRow
            label="분석 결과 저장 동의"
            desc="서비스 개선을 위해 익명화된 분석 결과를 활용합니다"
            checked={privacy.saveAnalysisData}
            onChange={v => setNested('privacy', 'saveAnalysisData', v)}
          />
        </SettingSection>

        {/* ⑦ 계정 설정 */}
        <SettingSection
          icon="🔑"
          title="계정 설정"
          subtitle="보안 및 계정 관련 설정을 관리하세요"
        >
          <div className="account-actions">
            <button className="btn-secondary" onClick={() => { setShowPwForm(v => !v); setPwError(''); }}>
              {showPwForm ? '취소' : '비밀번호 변경'}
            </button>
            <button className="btn-secondary" onClick={logout}>로그아웃</button>
          </div>

          {showPwForm && (
            <div className="pw-change-form">
              <input
                className="pw-input"
                type="password"
                placeholder="현재 비밀번호"
                value={pwForm.current}
                onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
              />
              <input
                className="pw-input"
                type="password"
                placeholder="새 비밀번호 (8자 이상)"
                value={pwForm.next}
                onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
              />
              <input
                className="pw-input"
                type="password"
                placeholder="새 비밀번호 확인"
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              />
              {pwError && <p className="pw-error">{pwError}</p>}
              <button className="btn-primary" onClick={handleChangePassword}>변경하기</button>
            </div>
          )}

          <div className="account-danger-zone">
            <div className="danger-zone-label">위험 구역</div>
            <div className="danger-zone-desc">
              회원탈퇴 시 모든 일기와 분석 데이터가 영구적으로 삭제됩니다.
            </div>
            <button className="btn-danger" onClick={handleWithdraw}>회원탈퇴</button>
          </div>
        </SettingSection>

        {/* ⑧ 하단 저장/초기화 */}
        <div className="settings-footer">
          <button className="btn-primary btn-save-all" onClick={handleSaveAll}>
            모든 설정 저장
          </button>
          <button className="btn-reset" onClick={handleReset}>
            기본값으로 초기화
          </button>
        </div>
      </main>

      {/* ── 오른쪽 패널 ────────────────────────────── */}
      <RightPanel settings={settings} profileImageUrl={profileImageUrl} />
    </div>
  );
};

export default SettingsPage;
