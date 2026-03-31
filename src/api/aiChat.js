// AI 응답 함수 — 나중에 이 함수만 교체하면 OpenAI / 백엔드 API로 전환 가능
const DUMMY_RESPONSES = [
  "그때 가장 크게 남은 감정은 무엇이었나요?",
  "조금 더 자세히 말해줄 수 있나요?",
  "그 상황에서 스스로에게 어떤 말을 해주고 싶나요?",
  "그 감정이 지금도 이어지고 있나요?",
  "오늘 하루 중 가장 위로가 되었던 순간은 언제였나요?",
  "그 경험이 내일의 나에게 어떤 영향을 줄 것 같나요?",
  "지금 이 순간 가장 필요한 것은 무엇인가요?",
  "그 마음을 조금 더 내려놓으려면 어떻게 하면 좋을까요?",
];

/**
 * AI 응답을 가져오는 함수
 * @param {Array<{role: string, text: string}>} messages - 전체 대화 기록
 * @returns {Promise<string>} AI 응답 텍스트
 */
export async function getAiResponse(messages) {
  /*
  ── OpenAI API 연동 예시 ──────────────────────────────────
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 사용자의 감정일기 작성을 도와주는 공감형 AI 어시스턴트입니다. 짧고 따뜻한 질문으로 하루를 정리할 수 있도록 도와주세요.',
        },
        ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
      ],
      max_tokens: 150,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
  ─────────────────────────────────────────────────────── */

  // 더미 응답 (프론트엔드 개발 단계)
  await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
  return DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)];
}
