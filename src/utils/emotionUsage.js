const STORAGE_KEY = 'emolens_emotion_usage';
const PROMOTION_THRESHOLD = 5;

export function getEmotionUsage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function incrementEmotionUsage(emotionIds) {
  const usage = getEmotionUsage();
  emotionIds.forEach(id => { usage[id] = (usage[id] || 0) + 1; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

/**
 * 사용 빈도가 PROMOTION_THRESHOLD 이상인 확장 감정을
 * 가장 적게 사용된 기본 감정 자리와 교체하여 8개 기본 목록을 반환.
 */
export function getPersonalizedBasicIds(basicIds, extendedIds) {
  const usage = getEmotionUsage();

  const promotable = extendedIds
    .filter(id => (usage[id] || 0) >= PROMOTION_THRESHOLD)
    .sort((a, b) => (usage[b] || 0) - (usage[a] || 0));

  if (promotable.length === 0) return basicIds;

  const result = [...basicIds];
  const basicByAscUsage = [...basicIds].sort((a, b) => (usage[a] || 0) - (usage[b] || 0));
  const swapped = new Set();

  for (const extId of promotable) {
    if (swapped.size >= basicIds.length) break;
    const target = basicByAscUsage.find(id => !swapped.has(id));
    if (!target) break;
    const idx = result.indexOf(target);
    result[idx] = extId;
    swapped.add(target);
  }

  return result;
}
