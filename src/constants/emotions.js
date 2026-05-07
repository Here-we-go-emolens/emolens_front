import happyImg    from '../assets/emotions/happy-removebg-preview.png';
import excitedImg  from '../assets/emotions/excited-removebg-preview.png';
import calmImg     from '../assets/emotions/calm-removebg-preview.png';
import proudImg    from '../assets/emotions/proud-removebg-preview.png';
import anxiousImg  from '../assets/emotions/anxious-removebg-preview.png';
import angryImg    from '../assets/emotions/angry-removebg-preview.png';
import sadImg      from '../assets/emotions/sad.png';
import tiredImg    from '../assets/emotions/tired-removebg-preview.png';
import gratefulImg from '../assets/emotions/grateful-removebg-preview.png';
import longingImg  from '../assets/emotions/longing-removebg-preview.png';
import lonelyImg   from '../assets/emotions/lonely-removebg-preview.png';
import annoyedImg  from '../assets/emotions/annoyed-removebg-preview.png';
import regretImg   from '../assets/emotions/regret-removebg-preview.png';
import shyImg      from '../assets/emotions/shy-removebg-preview.png';
import listlessImg from '../assets/emotions/listless-removebg-preview.png';
import blankImg    from '../assets/emotions/blank-removebg-preview.png';

export const PRIMARY_EMOTIONS = [
  { id: 'happy',   label: '행복',  image: happyImg,   category: 'positive', bg: '#FFFCE8', cardBg: '#FFFDF0', border: '#F5D050', glow: 'rgba(245,208,80,0.38)' },
  { id: 'excited', label: '설렘',  image: excitedImg, category: 'positive', bg: '#FFF0F5', cardBg: '#FFF5F9', border: '#F5A8C0', glow: 'rgba(245,168,192,0.38)' },
  { id: 'calm',    label: '평온',  image: calmImg,    category: 'neutral',  bg: '#EDFAF4', cardBg: '#F3FCF7', border: '#7DC9A0', glow: 'rgba(125,201,160,0.38)' },
  { id: 'proud',   label: '뿌듯',  image: proudImg,   category: 'positive', bg: '#FFF8E8', cardBg: '#FFFCF0', border: '#F5C050', glow: 'rgba(245,192,80,0.38)' },
  { id: 'anxious', label: '불안',  image: anxiousImg, category: 'negative', bg: '#F2EEFF', cardBg: '#F7F3FF', border: '#A090D8', glow: 'rgba(160,144,216,0.38)' },
  { id: 'angry',   label: '화남',  image: angryImg,   category: 'negative', bg: '#FFF0EE', cardBg: '#FFF5F4', border: '#E89090', glow: 'rgba(232,144,144,0.38)' },
  { id: 'sad',     label: '우울',  image: sadImg,     category: 'negative', bg: '#EEF4FF', cardBg: '#F3F7FF', border: '#6898D8', glow: 'rgba(104,152,216,0.38)' },
  { id: 'tired',   label: '피곤',  image: tiredImg,   category: 'neutral',  bg: '#F5F0E8', cardBg: '#FAF6EE', border: '#C0A878', glow: 'rgba(192,168,120,0.38)' },
];

export const EXTENDED_EMOTIONS = [
  { id: 'grateful', label: '감사',     image: gratefulImg, category: 'positive', bg: '#F0FFF8', cardBg: '#F5FFFC', border: '#80D8B0', glow: 'rgba(128,216,176,0.38)' },
  { id: 'longing',  label: '그리움',   image: longingImg,  category: 'mixed',    bg: '#EEF0FF', cardBg: '#F3F4FF', border: '#9098D8', glow: 'rgba(144,152,216,0.38)' },
  { id: 'lonely',   label: '외로움',   image: lonelyImg,   category: 'negative', bg: '#F0F4FF', cardBg: '#F5F7FF', border: '#8090C8', glow: 'rgba(128,144,200,0.38)' },
  { id: 'annoyed',  label: '짜증',     image: annoyedImg,  category: 'negative', bg: '#FFF4EE', cardBg: '#FFF8F5', border: '#E8A880', glow: 'rgba(232,168,128,0.38)' },
  { id: 'regret',   label: '후회',     image: regretImg,   category: 'negative', bg: '#F4F0FF', cardBg: '#F8F5FF', border: '#B098D8', glow: 'rgba(176,152,216,0.38)' },
  { id: 'shy',      label: '부끄러움', image: shyImg,      category: 'mixed',    bg: '#FFF0F8', cardBg: '#FFF5FC', border: '#E8A0C8', glow: 'rgba(232,160,200,0.38)' },
  { id: 'listless', label: '무기력',   image: listlessImg, category: 'negative', bg: '#F4F4F4', cardBg: '#F8F8F8', border: '#C0C0C8', glow: 'rgba(192,192,200,0.38)' },
  { id: 'blank',    label: '멍함',     image: blankImg,    category: 'neutral',  bg: '#F0F0F8', cardBg: '#F5F5FC', border: '#A8A8C0', glow: 'rgba(168,168,192,0.38)' },
];

export const ALL_EMOTIONS = [...PRIMARY_EMOTIONS, ...EXTENDED_EMOTIONS];

export const findEmotionById = (id) => ALL_EMOTIONS.find(e => e.id === id);

// ── 하위 호환 ───────────────────────────────────────────────
export const EMOTION_META          = ALL_EMOTIONS;
export const BASIC_EMOTION_IDS     = PRIMARY_EMOTIONS.map(e => e.id);
export const EXTENDED_EMOTION_IDS  = EXTENDED_EMOTIONS.map(e => e.id);
export const EMOTION_MAP           = Object.fromEntries(ALL_EMOTIONS.map(e => [e.id, e]));

export const SLIDER_COLOR = {
  positive: '#f26a21',
  negative: '#6b8cba',
  neutral:  '#9b9b9b',
  mixed:    '#9b9b9b',
};
