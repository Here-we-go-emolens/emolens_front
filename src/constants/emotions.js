export const EMOTION_META = [
  // ── 기본 8 ──
  { id: 'happy',    label: '행복',    emoji: '😊', category: 'positive', bg: '#FFFCE8', cardBg: '#FFFDF0', border: '#F5D050', glow: 'rgba(245,208,80,0.38)' },
  { id: 'excited',  label: '설렘',    emoji: '🌸', category: 'positive', bg: '#FFF0F5', cardBg: '#FFF5F9', border: '#F5A8C0', glow: 'rgba(245,168,192,0.38)' },
  { id: 'calm',     label: '평온',    emoji: '😌', category: 'positive', bg: '#EDFAF4', cardBg: '#F3FCF7', border: '#7DC9A0', glow: 'rgba(125,201,160,0.38)' },
  { id: 'proud',    label: '뿌듯',    emoji: '🌟', category: 'positive', bg: '#FFF8E8', cardBg: '#FFFCF0', border: '#F5C050', glow: 'rgba(245,192,80,0.38)' },
  { id: 'anxious',  label: '불안',    emoji: '😟', category: 'negative', bg: '#F2EEFF', cardBg: '#F7F3FF', border: '#A090D8', glow: 'rgba(160,144,216,0.38)' },
  { id: 'angry',    label: '화남',    emoji: '😠', category: 'negative', bg: '#FFF0EE', cardBg: '#FFF5F4', border: '#E89090', glow: 'rgba(232,144,144,0.38)' },
  { id: 'sad',      label: '우울',    emoji: '😢', category: 'negative', bg: '#EEF4FF', cardBg: '#F3F7FF', border: '#6898D8', glow: 'rgba(104,152,216,0.38)' },
  { id: 'tired',    label: '피곤',    emoji: '😴', category: 'neutral',  bg: '#F5F0E8', cardBg: '#FAF6EE', border: '#C0A878', glow: 'rgba(192,168,120,0.38)' },
  // ── 확장 8 ──
  { id: 'grateful', label: '감사',    emoji: '🙏', category: 'positive', bg: '#F0FFF8', cardBg: '#F5FFFC', border: '#80D8B0', glow: 'rgba(128,216,176,0.38)' },
  { id: 'longing',  label: '그리움',  emoji: '🌙', category: 'neutral',  bg: '#EEF0FF', cardBg: '#F3F4FF', border: '#9098D8', glow: 'rgba(144,152,216,0.38)' },
  { id: 'lonely',   label: '외로움',  emoji: '🫥', category: 'negative', bg: '#F0F4FF', cardBg: '#F5F7FF', border: '#8090C8', glow: 'rgba(128,144,200,0.38)' },
  { id: 'annoyed',  label: '짜증',    emoji: '😤', category: 'negative', bg: '#FFF4EE', cardBg: '#FFF8F5', border: '#E8A880', glow: 'rgba(232,168,128,0.38)' },
  { id: 'regret',   label: '후회',    emoji: '😔', category: 'negative', bg: '#F4F0FF', cardBg: '#F8F5FF', border: '#B098D8', glow: 'rgba(176,152,216,0.38)' },
  { id: 'shy',      label: '부끄러움', emoji: '🫣', category: 'neutral', bg: '#FFF0F8', cardBg: '#FFF5FC', border: '#E8A0C8', glow: 'rgba(232,160,200,0.38)' },
  { id: 'listless', label: '무기력',  emoji: '😶', category: 'negative', bg: '#F4F4F4', cardBg: '#F8F8F8', border: '#C0C0C8', glow: 'rgba(192,192,200,0.38)' },
  { id: 'blank',    label: '멍함',    emoji: '😑', category: 'neutral',  bg: '#F0F0F8', cardBg: '#F5F5FC', border: '#A8A8C0', glow: 'rgba(168,168,192,0.38)' },
];

export const BASIC_EMOTION_IDS    = ['happy', 'excited', 'calm', 'proud', 'anxious', 'angry', 'sad', 'tired'];
export const EXTENDED_EMOTION_IDS = ['grateful', 'longing', 'lonely', 'annoyed', 'regret', 'shy', 'listless', 'blank'];

export const EMOTION_MAP = Object.fromEntries(EMOTION_META.map(e => [e.id, e]));

export const SLIDER_COLOR = {
  positive: '#f26a21',
  negative: '#6b8cba',
  neutral:  '#9b9b9b',
};
