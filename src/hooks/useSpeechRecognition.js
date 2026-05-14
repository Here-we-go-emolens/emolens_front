import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Web Speech API 기반 음성 인식 훅
 * @param {{ onFinalResult?: (text: string) => void }} options
 */
export default function useSpeechRecognition({ onFinalResult } = {}) {
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');

  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  // 매 렌더마다 최신 콜백을 ref에 저장 (recognition 재생성 없이 최신 함수 사용)
  const onFinalRef = useRef(onFinalResult);
  useEffect(() => { onFinalRef.current = onFinalResult; });

  useEffect(() => {
    if (!isSupported) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          onFinalRef.current?.(transcript);
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onend = () => {
      // continuous 모드에서 침묵 등으로 자동 종료 시 재시작
      if (isRecordingRef.current) {
        try { recognition.start(); } catch { /* 이미 시작 중이면 무시 */ }
        return;
      }
      setInterimText('');
    };

    recognition.onerror = (e) => {
      // not-allowed/service-not-allowed는 복구 불가 — 녹음 중단
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        isRecordingRef.current = false;
        setIsRecording(false);
      }
      setInterimText('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported]);

  const toggle = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      rec.stop();
      setIsRecording(false);
      setInterimText('');
    } else {
      isRecordingRef.current = true;
      rec.start();
      setIsRecording(true);
    }
  }, []);

  return { isSupported, isRecording, interimText, toggle };
}
