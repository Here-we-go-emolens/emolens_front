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
      setIsRecording(false);
      setInterimText('');
    };

    recognition.onerror = () => {
      setIsRecording(false);
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
    if (isRecording) {
      rec.stop();
      setIsRecording(false);
      setInterimText('');
    } else {
      rec.start();
      setIsRecording(true);
    }
  }, [isRecording]);

  return { isSupported, isRecording, interimText, toggle };
}
