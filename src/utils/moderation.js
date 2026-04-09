const BLOCKED_PATTERNS = [
  /죽어/i,
  /꺼져/i,
  /병신/i,
  /미친놈|미친년/i,
  /개새끼|개새/i,
  /존나\s*(멍청|한심|역겹)/i,
];

const HIDDEN_PATTERNS = [
  /한심하네/i,
  /역겹네/i,
  /넌\s*답이\s*없/i,
  /진짜\s*최악이/i,
  /쓸모없/i,
  /너같은/i,
  /비웃고\s*싶/i,
];

const WARNING_PATTERNS = [
  /왜\s*그것도\s*못/i,
  /그걸\s*가지고\s*유난/i,
  /또\s*징징/i,
  /그냥\s*참아/i,
  /별것도\s*아닌데/i,
  /너무\s*예민/i,
];

export function detectToxicity(text) {
  const normalized = text.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    return { status: 'safe', message: '' };
  }

  if (BLOCKED_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      status: 'blocked',
      message: '강한 욕설이나 모욕 표현이 포함되어 있어 등록할 수 없어요.',
    };
  }

  if (HIDDEN_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      status: 'hidden',
      message: '공격적이거나 비하하는 표현이 감지되어 숨김 처리될 수 있어요.',
    };
  }

  if (WARNING_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      status: 'warning',
      message: '상대에게 상처가 될 수 있는 표현이 포함되어 있어요. 표현을 다듬어주세요.',
    };
  }

  return { status: 'safe', message: '' };
}
