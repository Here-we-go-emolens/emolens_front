import { useEffect, useRef } from 'react';
import { getAccessToken } from '@/services/auth';

// SSE는 커스텀 헤더를 지원하지 않으므로 토큰을 쿼리 파라미터로 전달
// 백엔드: GET /api/notifications/stream?token={accessToken}
export function useNotificationSSE(onNotification) {
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    let es = null;
    let retryTimer = null;
    let destroyed = false;

    function connect() {
      const token = getAccessToken();
      if (!token || destroyed) return;

      const base = import.meta.env.VITE_API_BASE_URL ?? '';
      const url = `${base}/api/notifications/stream?token=${encodeURIComponent(token)}`;
      es = new EventSource(url);

      es.addEventListener('NOTIFICATION', (e) => {
        try {
          callbackRef.current?.(JSON.parse(e.data));
        } catch {}
      });

      // 토큰 만료/무효 시 서버가 AUTH_ERROR 이벤트를 보냄
      // → 최신 토큰으로 3초 후 재연결 시도
      es.addEventListener('AUTH_ERROR', () => {
        es.close();
        if (!destroyed) {
          retryTimer = setTimeout(connect, 3000);
        }
      });

      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) es.close();
      };
    }

    connect();

    return () => {
      destroyed = true;
      clearTimeout(retryTimer);
      es?.close();
    };
  }, []); // 로그인 세션 동안 단일 연결 유지, AUTH_ERROR 시 재연결
}
