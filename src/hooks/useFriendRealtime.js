// ============================================================
//  useFriendRealtime.js
//  친구 실시간 상태 관리 커스텀 훅
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { createFriendSocket } from '../services/friendSocket';

const HIGHLIGHT_DURATION = 2200; // ms — 강조 유지 시간

// 온라인 > 자리비움 > 오프라인, 같은 상태면 unread 많은 순
function sortFriends(list) {
  const order = { online: 0, away: 1, offline: 2 };
  return [...list].sort((a, b) => {
    const od = (order[a.status] ?? 2) - (order[b.status] ?? 2);
    if (od !== 0) return od;
    return (b.unreadCount || 0) - (a.unreadCount || 0);
  });
}

/**
 * useFriendRealtime
 * @param {object}  opts
 * @param {boolean} opts.mock   - mock 모드 (기본 true)
 * @param {string}  opts.wsUrl  - 실제 WebSocket URL
 *
 * @returns {{
 *   friends: Array,
 *   connectionStatus: string,
 *   recentlyChanged: Set,
 *   clearUnread: (id: number) => void,
 *   reconnect: () => void,
 * }}
 */
export function useFriendRealtime({ mock = true, wsUrl } = {}) {
  const [friends, setFriends] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  // recentlyChanged: 최근 변경된 친구 id Set (highlight 용)
  const [recentlyChanged, setRecentlyChanged] = useState(new Set());

  const socketRef = useRef(null);
  const highlightTimersRef = useRef({});
  // 최신 mock/wsUrl 값을 ref로 유지 (stale closure 방지)
  const optsRef = useRef({ mock, wsUrl });
  optsRef.current = { mock, wsUrl };

  // ── highlight 추가 / 자동 제거 ──────────────────────────
  const markChanged = useCallback((id) => {
    setRecentlyChanged((prev) => new Set([...prev, id]));

    if (highlightTimersRef.current[id]) {
      clearTimeout(highlightTimersRef.current[id]);
    }
    highlightTimersRef.current[id] = setTimeout(() => {
      setRecentlyChanged((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      delete highlightTimersRef.current[id];
    }, HIGHLIGHT_DURATION);
  }, []);

  // ── 이벤트 핸들러 ────────────────────────────────────────
  const handleMessage = useCallback(
    (event) => {
      const { type, payload } = event;

      switch (type) {
        case 'initial_data':
          setFriends(sortFriends(payload.friends));
          break;

        case 'friend_status_changed':
          setFriends((prev) =>
            sortFriends(
              prev.map((f) =>
                f.id === payload.id
                  ? { ...f, status: payload.status, lastActive: payload.lastActive }
                  : f
              )
            )
          );
          markChanged(payload.id);
          break;

        case 'friend_emotion_updated':
          setFriends((prev) =>
            prev.map((f) =>
              f.id === payload.id
                ? {
                    ...f,
                    emotion: payload.emotion,
                    emotionLabel: payload.emotionLabel,
                    emotionColor: payload.emotionColor,
                  }
                : f
            )
          );
          markChanged(payload.id);
          break;

        case 'friend_message_received':
          setFriends((prev) =>
            sortFriends(
              prev.map((f) =>
                f.id === payload.id
                  ? {
                      ...f,
                      unreadCount: (f.unreadCount || 0) + payload.unreadCount,
                      lastActive: '방금 전',
                    }
                  : f
              )
            )
          );
          markChanged(payload.id);
          break;

        case 'friend_added':
          setFriends((prev) => sortFriends([payload.friend, ...prev]));
          markChanged(payload.friend.id);
          break;

        case 'friend_removed':
          setFriends((prev) => prev.filter((f) => f.id !== payload.id));
          break;

        default:
          break;
      }
    },
    [markChanged]
  );

  // ── 연결 / 해제 ──────────────────────────────────────────
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    Object.values(highlightTimersRef.current).forEach(clearTimeout);
    highlightTimersRef.current = {};
  }, []);

  const connect = useCallback(() => {
    setConnectionStatus('connecting');
    socketRef.current = createFriendSocket({
      mock: optsRef.current.mock,
      wsUrl: optsRef.current.wsUrl,
      onOpen: () => setConnectionStatus('connected'),
      onClose: () => setConnectionStatus('disconnected'),
      onMessage: handleMessage,
    });
  }, [handleMessage]);

  const reconnect = useCallback(() => {
    disconnect();
    setConnectionStatus('reconnecting');
    setTimeout(connect, 800);
  }, [disconnect, connect]);

  // ── 마운트 시 연결, 언마운트 시 해제 ─────────────────────
  useEffect(() => {
    connect();
    return disconnect;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── unread 제거 ───────────────────────────────────────────
  const clearUnread = useCallback((id) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, unreadCount: 0 } : f))
    );
  }, []);

  return {
    friends,
    connectionStatus,
    recentlyChanged,
    clearUnread,
    reconnect,
  };
}
