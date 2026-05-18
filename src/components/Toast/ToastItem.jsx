import { useEffect, useRef, useState } from 'react';

const CONFIG = {
  success: { icon: '✓', label: '성공' },
  error:   { icon: '✕', label: '오류' },
  warning: { icon: '!', label: '주의' },
  info:    { icon: 'i', label: '알림' },
};

export default function ToastItem({ id, message, type, duration, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef(null);

  const dismiss = () => {
    clearTimeout(timerRef.current);
    setLeaving(true);
    setTimeout(() => onRemove(id), 380);
  };

  useEffect(() => {
    // mount 후 한 프레임 뒤에 visible = true (enter 애니메이션 트리거)
    const frame = requestAnimationFrame(() => setVisible(true));
    timerRef.current = setTimeout(dismiss, duration);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { icon } = CONFIG[type] ?? CONFIG.info;

  return (
    <div
      className={`toast-item toast-${type} ${visible ? 'toast-enter' : ''} ${leaving ? 'toast-leave' : ''}`}
      onClick={dismiss}
    >
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{message}</span>
      <div
        className="toast-progress"
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
}
