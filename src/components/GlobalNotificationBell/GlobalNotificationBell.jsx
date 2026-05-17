import { useState, useEffect, useCallback, useRef } from 'react';
import { getLetters } from '@/services/letterApi';
import { getNotifications } from '@/services/notificationApi';
import NotificationPopup from '@/components/NotificationPopup/NotificationPopup';
import './GlobalNotificationBell.css';

export default function GlobalNotificationBell() {
  const [show, setShow]           = useState(false);
  const [unreadCount, setUnread]  = useState(0);
  const fetchedRef = useRef(false);

  const fetchUnread = useCallback(() => {
    Promise.all([
      getLetters().catch(() => []),
      getNotifications().catch(() => []),
    ]).then(([letters, notis]) => {
      const count =
        letters.filter(l => !l.isRead).length +
        notis.filter(n => !n.isRead).length;
      setUnread(count);
    });
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    const onLetterRead = () => fetchUnread();
    window.addEventListener('letter-read', onLetterRead);
    return () => window.removeEventListener('letter-read', onLetterRead);
  }, [fetchUnread]);

  const close = useCallback(() => {
    setShow(false);
    fetchUnread();
  }, [fetchUnread]);

  return (
    <>
      <button
        className={`gnb-bell ${show ? 'active' : ''}`}
        onClick={() => setShow(v => !v)}
        aria-label="알림"
      >
        🔔
        {unreadCount > 0 && (
          <span className="gnb-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      {show && <NotificationPopup onClose={close} />}
    </>
  );
}
