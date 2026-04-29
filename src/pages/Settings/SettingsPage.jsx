import { useState, useEffect } from 'react';
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { logout } from '@/services/userApi';
import '@/styles/Settings/SettingsPage.css';

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
    darkMode: false,
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
const RightPanel = ({ settings }) => {
  const { profile, notifications, writing, ai } = settings;
  const notifOn = Object.values(notifications).some(Boolean);
  const aiOn    = Object.values(ai).some(Boolean);

  return (
    <aside className="right-panel">
      {/* 프로필 미리보기 */}
      <div className="rp-card rp-profile">
        <div className="rp-card-label">프로필 미리보기</div>
        <div className="rp-avatar">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="profile"
          />
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
  const user = useCurrentUser();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [profileDraft, setProfileDraft] = useState({ ...DEFAULT_SETTINGS.profile });
  const [toast, setToast] = useState(null); // { msg, type }

  useEffect(() => {
    if (!user) return;
    const profile = {
      nickname: user.name  ?? '',
      bio:      user.bio   ?? '',
      email:    user.email?.endsWith('@social.local') ? '' : (user.email ?? ''),
    };
    setSettings(prev => ({ ...prev, profile }));
    setProfileDraft(profile);
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

  /* 프로필 저장 */
  const handleProfileSave = () => {
    setSettings(prev => ({ ...prev, profile: { ...profileDraft } }));
    showToast('프로필이 저장되었습니다.');
  };

  /* 전체 저장 */
  const handleSaveAll = () => {
    setSettings(prev => ({ ...prev, profile: { ...profileDraft } }));
    showToast('모든 설정이 저장되었습니다.');
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
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="profile"
                className="profile-edit-img"
              />
              <button className="avatar-change-btn">사진 변경</button>
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
              <div className="field-group">
                <label className="field-label">이메일</label>
                <input
                  className="field-input field-input-readonly"
                  type="email"
                  value={profileDraft.email}
                  onChange={e =>
                    setProfileDraft(p => ({ ...p, email: e.target.value }))
                  }
                  placeholder="이메일을 입력하세요"
                />
              </div>
              <button className="btn-primary" onClick={handleProfileSave}>
                프로필 저장
              </button>
            </div>
          </div>
        </SettingSection>

        {/* ② 계정 설정 */}
        <SettingSection
          icon="🔑"
          title="계정 설정"
          subtitle="보안 및 계정 관련 설정을 관리하세요"
        >
          <div className="account-actions">
            <button className="btn-secondary">비밀번호 변경</button>
            <button className="btn-secondary" onClick={logout}>로그아웃</button>
          </div>
          <div className="account-danger-zone">
            <div className="danger-zone-label">위험 구역</div>
            <div className="danger-zone-desc">
              회원탈퇴 시 모든 일기와 분석 데이터가 영구적으로 삭제됩니다.
            </div>
            <button className="btn-danger">회원탈퇴</button>
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
          <ToggleRow
            label="다크모드 스타일 선호"
            desc="다크모드를 기본 스타일로 사용합니다"
            checked={writing.darkMode}
            onChange={v => setNested('writing', 'darkMode', v)}
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

        {/* ⑦ 하단 저장/초기화 */}
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
      <RightPanel settings={settings} />
    </div>
  );
};

export default SettingsPage;
