import { useEffect, useRef } from 'react';
import { getAccessToken } from '@/services/auth';

// SSE는 커스텀 헤더를 지원하지 않으므로 토큰을 쿼리 파라미터로 전달
// 백엔드: GET /api/notifications/stream?token={accessToken}
export function useNotificationSSE(onNotification) {
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const base = import.meta.env.VITE_API_BASE_URL ?? '';
    const url = `${base}/api/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.addEventListener('NOTIFICATION', (e) => {
      try {
        callbackRef.current?.(JSON.parse(e.data));
      } catch {}
    });

    // 토큰 만료/무효 시 서버가 AUTH_ERROR 이벤트를 보내고 연결 종료
    // → 브라우저의 자동 재연결을 막기 위해 명시적으로 close()
    es.addEventListener('AUTH_ERROR', () => {
      es.close();
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) es.close();
    };

    return () => es.close();
  }, []); // 로그인 세션 동안 단일 연결 유지
}
