import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentWeather } from '@/api/Weather/Weather';
import SidebarLeft from '@/components/Sidebar-left/SidebarLeft';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { createDiary, uploadImage } from '@/services/diaryApi';
import { incrementEmotionUsage } from '@/utils/emotionUsage';
import { EMOTION_MAP, findEmotionById } from '@/constants/emotions';
import EmotionSelector from './EmotionSelector';
import mascotFallback from '@/assets/mascot-removebg-preview.png';
import '@/styles/CreateDiary/DiaryWritePage.css';

// ── 일기 형식 ──────────────────────────────────────────────
const TEMPLATES = [
  { id: 'plain',    label: '내지',  icon: '📄', desc: '빈 페이지 형식' },
  { id: 'notebook', label: '공책',  icon: '📓', desc: '줄 노트 형식' },
  { id: 'letter',   label: '편지',  icon: '✉️', desc: '편지 형식으로' },
];

// ── 말풍선 문구 (16종) ─────────────────────────────────────
const COMPANION_MESSAGES = {
  happy:    '행복한 오늘을\n더 자세히 기억해봐요 😊',
  excited:  '설레는 마음을\n글로 담아볼까요? 🌸',
  calm:     '고요한 마음으로\n천천히 적어보세요 😌',
  proud:    '뿌듯한 오늘을\n스스로 칭찬해봐요 🌟',
  anxious:  '불안해도 괜찮아요,\n함께 풀어봐요 🤗',
  angry:    '화가 난 마음을\n여기서 털어놓아요 😤',
  sad:      '힘든 마음, 여기서\n털어놓아도 돼요 💙',
  tired:    '오늘도 수고했어요.\n천천히 돌아봐요 😴',
  grateful: '감사한 마음을\n오래 담아두고 싶어요 🙏',
  longing:  '그리운 마음을\n천천히 꺼내봐요 🌙',
  lonely:   '외로운 마음도\n여기선 괜찮아요 🫥',
  annoyed:  '짜증나는 하루였군요,\n다 말해봐요 😤',
  regret:   '후회되는 마음,\n같이 들여다봐요 😔',
  shy:      '부끄러운 순간도\n솔직하게 적어봐요 🫣',
  listless: '무기력한 오늘,\n그냥 앉아 있어도 돼요 😶',
  blank:    '멍한 마음 그대로\n천천히 적어봐요 😑',
};

// ── 셔플 ───────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 날짜/날씨 유틸 ─────────────────────────────────────────
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(d) {
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')} (${DAYS[d.getDay()]})`;
}

function getWeatherEmoji(id) {
  if (!id) return '🌡️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id === 800) return '☀️';
  if (id <= 802) return '🌤️';
  return '☁️';
}

function getWeatherLabel(id) {
  if (!id) return '';
  if (id === 800) return '맑음';
  if (id <= 802) return '구름 조금';
  if (id <= 804) return '흐림';
  if (id >= 500 && id < 600) return '비';
  if (id >= 600 && id < 700) return '눈';
  return '흐림';
}

function getWeatherEnum(id) {
  if (!id) return null;
  if (id === 800 || id === 801) return 'SUNNY';
  if (id >= 802 && id <= 804) return 'CLOUDY';
  if (id >= 500 && id < 600) return 'RAINY';
  if (id >= 600 && id < 700) return 'SNOWY';
  return 'CLOUDY';
}

// ── 감정별 질문 풀 ─────────────────────────────────────────
const GENERAL_QUESTIONS = [
  '오늘 가장 오래 남은 감정은 무엇인가요?', '그 감정은 언제부터 시작됐나요?',
  '오늘 나에게 가장 좋았던 순간은?', '지금 이 순간 가장 솔직한 내 마음은?',
  '오늘 하루를 색깔로 표현한다면 무슨 색인가요?', '오늘 가장 기억에 남는 장면을 묘사해보세요',
  '내일의 나에게 해주고 싶은 말은?', '오늘 가장 잘 버텨낸 순간은?',
  '오늘 예상치 못했던 일이 있었나요?', '지금 내 옆에 있어줬으면 하는 사람은 누구인가요?',
  '오늘 위로받고 싶었던 순간이 있었나요?', '지금 나에게 가장 필요한 것은 무엇인가요?',
  '내일은 어떤 하루이길 바라나요?', '오늘 나를 가장 나답게 만든 순간은?',
  '이 일기를 미래의 내가 읽는다면 어떤 말을 전하고 싶나요?',
  '오늘 하루를 한 문장으로 표현한다면?', '가장 솔직하게 느낀 감정은 무엇인가요?',
  '오늘 나 자신에게 고마운 점이 있다면?', '지금 마음속 가장 큰 생각은 무엇인가요?',
  '오늘을 통해 나에 대해 새롭게 알게 된 것은?',
];

const EMOTION_QUESTIONS = {
  happy: [
    '행복을 느꼈던 순간을 자세히 묘사해보세요', '그 기쁨을 누구와 나누고 싶었나요?',
    '이 행복이 어디서 왔다고 생각하나요?', '오늘 가장 환하게 웃었던 순간은?',
    '이 행복을 오래 기억하려면 어떻게 하면 좋을까요?', '오늘 나를 웃게 한 것은 무엇인가요?',
    '행복한 오늘을 만들어준 사람이 있나요?', '이 감정을 내일도 이어가려면 어떻게 하면 좋을까요?',
    '행복할 때 나는 어떤 사람이 되나요?', '오늘의 행복을 한 단어로 표현한다면?',
    '소소하지만 확실했던 행복은 무엇인가요?', '오늘 가장 감사했던 순간은 언제인가요?',
    '이 기분을 느낄 수 있게 해준 환경이나 조건이 있나요?',
    '행복한 지금, 나에게 선물하고 싶은 것이 있다면?',
    '오늘의 행복을 미래의 나에게 어떻게 전달하고 싶나요?',
  ],
  excited: [
    '무엇이 당신을 이렇게 설레게 했나요?', '그 설렘은 어디서 시작됐나요?',
    '설레는 마음을 어떻게 표현했나요?', '설렘 뒤에 조금 두려운 마음도 있나요?',
    '이 기대감이 현실이 된다면 어떨 것 같나요?', '앞으로 더 기대되는 것이 있나요?',
    '설렘과 함께 느껴지는 다른 감정은?', '이 에너지를 내일 어떻게 활용하고 싶나요?',
    '설레는 마음을 오래 간직하려면 어떻게 해야 할까요?',
    '설렘을 느낄 때 몸의 반응은 어떤가요?', '설레는 지금 이 순간 가장 하고 싶은 것은?',
    '이 설렘이 나에게 가르쳐주는 것은 무엇인가요?',
    '설렘을 느낄 때 나는 어떤 모습인가요?',
    '지금 이 설렘을 누군가에게 전한다면 어떻게 표현할 건가요?',
    '기대가 현실이 되는 순간을 상상해보세요',
  ],
  calm: [
    '오늘 평온함을 느낀 순간은 언제였나요?', '그 고요함이 어디서 왔다고 생각하나요?',
    '평온한 오늘을 만들어준 것은 무엇인가요?',
    '이 차분함 속에서 어떤 생각이 가장 많이 떠올랐나요?',
    '평온할 때 나는 어떤 사람이 되나요?', '지금 이 평온함을 더 오래 유지하려면?',
    '마음이 편안할 때 어떤 생각이 떠오르나요?', '오늘 나에게 충분했던 것은 무엇인가요?',
    '평온한 마음으로 새롭게 보이는 것이 있나요?',
    '이 차분한 에너지로 하고 싶은 것은 무엇인가요?', '평온함 속에서 깨달은 것이 있나요?',
    '오늘 가장 여유로웠던 순간을 묘사해보세요',
    '평온함이 습관이 되려면 어떤 것이 필요할까요?',
    '지금 이 고요함 속에 감사한 것이 있다면?',
    '평온한 오늘이 내일에게 주는 선물은 무엇인가요?',
  ],
  proud: [
    '오늘 스스로를 칭찬해주고 싶은 순간은?', '그 뿌듯함은 무엇이 만들어준 건가요?',
    '이 성취를 이루기까지 어떤 과정이 있었나요?', '뿌듯함을 누군가와 나누고 싶다면 누구인가요?',
    '이 기분을 내일도 이어가려면 어떻게 해야 할까요?',
    '오늘 내가 잘한 것을 세 가지 꼽는다면?',
    '이 뿌듯함이 나에게 어떤 자신감을 주나요?', '앞으로 더 도전해보고 싶은 것이 있나요?',
    '나 자신에게 선물을 준다면 무엇을 주고 싶나요?',
    '오늘의 성취를 미래의 나에게 어떻게 전하고 싶나요?',
    '이 경험이 나에 대해 알려준 것은 무엇인가요?',
    '뿌듯한 마음이 가장 강하게 느껴진 순간은?',
    '이 기분이 습관이 되면 어떤 삶이 될까요?',
    '나를 이 자리까지 오게 해준 것들에게 감사할 수 있다면?',
    '오늘 나는 어떤 모습의 내가 자랑스러웠나요?',
  ],
  anxious: [
    '지금 가장 마음에 걸리는 것은 무엇인가요?', '그 불안은 언제부터 시작됐나요?',
    '지금 당장 할 수 있는 가장 작은 한 가지는?', '불안을 느낄 때 몸이 어떻게 반응하나요?',
    '불안한 나에게 친구처럼 말해준다면 뭐라고 할 건가요?',
    '불안이 말하려는 것이 있다면 무엇일까요?',
    '과거에 비슷한 불안을 어떻게 넘겼나요?', '지금 나에게 가장 필요한 위로는?',
    '이 걱정이 실제로 일어날 가능성은 얼마나 될까요?',
    '불안을 줄여주는 나만의 방법이 있나요?',
    '불안 뒤에 숨어있는 진짜 감정은 무엇인가요?',
    '지금 이 불안을 내려놓는다면 어떤 기분일까요?',
    '내가 통제할 수 있는 것과 없는 것을 나눠본다면?',
    '불안 속에서도 내가 잘하고 있는 것은 무엇인가요?',
    '지금 당장 나를 안심시켜줄 수 있는 것은?',
  ],
  angry: [
    '무엇이 오늘 나를 화나게 했나요?', '그 화는 언제부터 쌓이기 시작했나요?',
    '화가 날 때 나는 어떻게 행동하는 편인가요?', '이 분노 뒤에 숨어있는 감정이 있다면?',
    '화를 건강하게 표현하는 나만의 방법은?', '이 상황에서 내가 원하는 것은 무엇인가요?',
    '화나게 한 상대에게 솔직히 전하고 싶은 말은?',
    '분노가 가라앉은 뒤 나는 어떤 감정이 남을 것 같나요?',
    '지금 당장 마음을 식히는 데 도움이 되는 것은?',
    '이 화가 내게 알려주는 나의 가치관은 무엇인가요?',
    '비슷한 상황에서 다음엔 어떻게 대응하고 싶나요?',
    '화를 낸 뒤 후회한 경험이 있나요?',
    '지금 나를 가장 이해해줄 수 있는 사람은 누구인가요?',
    '이 감정이 지나고 나면 무엇이 남을 것 같나요?',
    '오늘의 분노에서 내가 배울 수 있는 것은?',
  ],
  sad: [
    '오늘 마음이 무거웠던 이유는 무엇인가요?', '그 감정을 혼자 안고 있었나요?',
    '지금 나에게 따뜻한 말 한마디를 건넨다면?',
    '지금 이 감정이 얼마나 오래된 것 같나요?',
    '마음이 무거울 때 나는 어디로 가고 싶어지나요?',
    '우울함 속에서도 버텨낸 순간이 있었나요?', '지금 가장 듣고 싶은 말은 무엇인가요?',
    '내일은 조금 나아질 것 같은 이유가 있나요?',
    '지금 나를 가장 힘들게 하는 생각은 무엇인가요?',
    '이 감정을 색깔로 표현한다면 어떤 색인가요?',
    '이 감정이 전하려는 메시지가 있다면?',
    '지금 가장 필요한 것은 위로인가요, 해결책인가요?',
    '우울한 나를 가장 이해해줄 수 있는 사람은 누구인가요?',
    '이 감정이 지나고 나면 무엇이 남을 것 같나요?',
    '지금 당장 나를 조금 편하게 해줄 수 있는 것은?',
  ],
  tired: [
    '오늘 무엇이 나를 가장 지치게 했나요?',
    '몸과 마음 중 어느 쪽이 더 피곤한가요?',
    '지금 가장 쉬고 싶은 방식은 무엇인가요?',
    '피곤함이 쌓이기 시작한 것은 언제부터인가요?',
    '지금 내게 가장 필요한 것은 수면인가요, 감정적 회복인가요?',
    '피곤함 속에서도 해낸 것이 있다면 무엇인가요?',
    '내가 덜 지치려면 무엇이 달라져야 할까요?',
    '오늘 나 자신을 위한 작은 선물을 준다면?',
    '피곤할 때 나는 어떤 것에 가장 예민해지나요?',
    '충전이 되는 나만의 방법이 있나요?',
    '피곤한 오늘, 그래도 고마운 순간이 있었나요?', '충전을 위해 지금 당장 할 수 있는 것은?',
    '나를 지치게 하는 것과 채워주는 것은 각각 무엇인가요?',
    '지금 이 피곤함을 누군가에게 털어놓는다면?',
    '오늘 수고한 나에게 어떤 말을 해주고 싶나요?',
  ],
  grateful: [
    '오늘 가장 감사했던 순간은 언제인가요?', '그 감사함을 누구에게 전하고 싶었나요?',
    '감사함을 느낄 때 마음이 어떻게 달라지나요?', '당연하게 여겼지만 사실 감사한 것이 있다면?',
    '오늘 나를 도와준 사람에게 전하고 싶은 말은?',
    '감사한 마음을 표현한 적이 있나요? 어떻게 했나요?',
    '이 감사함이 내일의 나에게 주는 영향은?',
    '감사함을 자주 느끼는 나만의 루틴이 있나요?',
    '오늘 하루를 감사 일기 형식으로 세 줄 적는다면?',
    '감사한 사람이나 상황을 떠올릴 때 어떤 감정이 드나요?',
    '작은 것에 감사하는 연습을 해본다면 어떤 것부터 시작할까요?',
    '이 감사함이 나를 어떤 사람으로 만들어주나요?',
    '오늘 감사함을 느끼게 해준 것을 더 자세히 묘사해보세요',
    '감사함이 넘칠 때 나는 어떤 모습인가요?',
    '오늘의 감사함을 내일도 이어가려면 어떻게 해야 할까요?',
  ],
  longing: [
    '지금 무엇이 혹은 누가 그리운가요?', '그 그리움은 언제부터 시작됐나요?',
    '그리운 것을 생각할 때 어떤 감각이 떠오르나요?',
    '그리운 사람이나 장소에 대한 기억을 자세히 묘사해보세요',
    '그 그리움이 지금의 나에게 주는 의미는?',
    '그리운 마음을 어떻게 달래고 있나요?',
    '그리운 것이 지금 옆에 있다면 무엇을 하고 싶나요?',
    '그리움이 나에게 알려주는 소중한 것은 무엇인가요?',
    '그리운 것과 다시 연결되는 방법이 있을까요?',
    '그리움을 느낄 때 나는 어떤 행동을 하게 되나요?',
    '그 기억 속 가장 따뜻한 순간은 무엇인가요?',
    '그리움과 함께 느껴지는 다른 감정은?',
    '그리운 것에게 편지를 쓴다면 뭐라고 할 건가요?',
    '그리움이 지나고 나면 어떤 감정이 남나요?',
    '그리운 기억이 지금 나를 어떻게 위로해주나요?',
  ],
  lonely: [
    '지금 외로움을 느끼는 이유가 무엇인가요?', '혼자라는 느낌이 언제부터였나요?',
    '지금 가장 곁에 있어줬으면 하는 사람은 누구인가요?',
    '외로움을 달래주는 나만의 방법이 있나요?',
    '혼자 있을 때 나는 무엇을 하게 되나요?',
    '외로움과 고독의 차이를 나에게 비교해본다면?',
    '지금 나에게 연락해볼 수 있는 사람이 있나요?',
    '외로움 속에서 스스로 위로할 수 있는 방법은?',
    '외로울 때 읽거나 보거나 듣고 싶은 것이 있나요?',
    '이 외로움이 알려주는 내가 원하는 관계는?',
    '혼자인 지금 나에게 말을 건다면 뭐라고 할 건가요?',
    '외로운 마음을 글로 적으면 어떤 변화가 있을까요?',
    '이 외로움이 지나고 나면 무엇이 달라질까요?',
    '혼자이지만 괜찮았던 순간이 있었나요?',
    '외로움이 나에게 주는 선물이 있다면 무엇일까요?',
  ],
  annoyed: [
    '오늘 무엇이 가장 짜증스러웠나요?', '그 짜증은 어디서부터 시작됐나요?',
    '짜증이 날 때 나는 어떻게 반응하는 편인가요?',
    '이 짜증 뒤에 숨어있는 진짜 감정은 무엇인가요?',
    '짜증이 쌓이지 않으려면 어떻게 해야 할까요?',
    '지금 가장 마음을 식히는 방법은?',
    '짜증나게 한 상황에 내가 원하는 것은 무엇인가요?',
    '짜증을 줄여주는 나만의 루틴이 있나요?',
    '이 짜증이 습관적으로 느껴지는 상황이 있나요?',
    '짜증나는 하루였지만 그래도 좋았던 순간이 있다면?',
    '짜증스러운 감정을 건강하게 해소하는 방법은?',
    '이 상황이 반복된다면 어떻게 달리 대응해보고 싶나요?',
    '짜증이 가라앉은 뒤 나는 어떤 감정이 남나요?',
    '지금 당장 기분 전환이 되는 것은 무엇인가요?',
    '짜증나는 하루에도 나는 잘 버텼어요. 어떤 점이 그랬나요?',
  ],
  regret: [
    '오늘 후회되는 일이 있었나요?', '그 후회는 어떤 선택이나 행동에서 비롯됐나요?',
    '만약 다시 그 순간으로 돌아간다면 어떻게 하고 싶나요?',
    '후회가 나에게 알려주는 가치관은 무엇인가요?',
    '그 선택을 했던 당시 나는 최선을 다했나요?',
    '후회를 통해 앞으로 달라질 수 있는 것이 있다면?',
    '후회하는 마음을 상대에게 전할 수 있다면?',
    '후회 대신 배움으로 바꾸어 생각해본다면?',
    '이 후회가 나를 성장시키는 방식은 무엇인가요?',
    '후회될 때 나를 다독여주는 말이 있나요?',
    '지금 이 감정을 내려놓는다면 어떤 기분일까요?',
    '과거의 나를 용서할 수 있다면 어떤 말을 건네주고 싶나요?',
    '후회와 책임감의 차이를 나에게 비교해본다면?',
    '이 후회를 통해 내일의 나에게 주고 싶은 교훈은?',
    '후회가 지나고 나면 무엇이 남을 것 같나요?',
  ],
  shy: [
    '오늘 부끄러웠던 순간은 언제인가요?', '그 순간 몸은 어떻게 반응했나요?',
    '부끄러움을 느낄 때 나는 어떻게 행동하는 편인가요?',
    '그 상황에서 내가 원했던 것은 무엇인가요?',
    '부끄러운 순간을 웃으며 돌아볼 수 있다면 어떨까요?',
    '부끄러움이 나를 더 조심스럽게 만드는 이유는?',
    '가장 오래 기억에 남는 부끄러운 순간은?',
    '부끄러움 뒤에 숨어있는 진짜 감정은 무엇인가요?',
    '부끄러워하는 나를 따뜻하게 안아준다면 어떤 말을 할까요?',
    '이 부끄러움이 나에게 알려주는 것은 무엇인가요?',
    '부끄러움을 극복하는 나만의 방법이 있나요?',
    '지금의 나를 가장 이해해줄 사람은 누구인가요?',
    '부끄러운 나를 있는 그대로 받아들이는 연습을 해본다면?',
    '이 감정이 지나고 나면 무엇이 남을 것 같나요?',
    '부끄러움 속에서도 나는 어떤 용기를 냈나요?',
  ],
  listless: [
    '오늘 무기력함이 언제부터 시작됐나요?', '지금 아무것도 하기 싫은 이유가 있나요?',
    '무기력할 때 나는 주로 무엇을 하게 되나요?',
    '이 무기력함이 얼마나 오래된 것 같나요?',
    '지금 당장 딱 하나만 해야 한다면 무엇을 하고 싶나요?',
    '무기력할 때 조금이라도 힘이 나는 것이 있나요?',
    '이 무기력함이 나에게 하고 싶은 말이 있다면?',
    '지금 가장 필요한 것이 휴식인가요, 동기인가요?',
    '무기력한 오늘도 나는 어떤 것을 해냈나요?',
    '충전이 되는 나만의 방법이 있나요?',
    '이 무기력함이 반복되는 패턴이 있나요?',
    '나를 일어나게 해주는 작은 것들이 있다면?',
    '지금의 나에게 가장 필요한 위로의 말은?',
    '무기력함이 지나고 나면 나는 어떤 모습이 되고 싶나요?',
    '오늘 그냥 있어도 괜찮아요. 지금 마음을 적어볼까요?',
  ],
  blank: [
    '지금 마음이 멍한 이유가 있나요?', '아무 생각이 없다는 느낌이 언제부터였나요?',
    '멍한 마음 속에서 그나마 떠오르는 것이 있다면?',
    '지금 이 순간 몸은 어떤 상태인가요?',
    '멍할 때 나는 주로 어디를 바라보게 되나요?',
    '이 멍함 속에 숨어있는 감정이 있다면 무엇일까요?',
    '아무것도 느껴지지 않을 때 나는 어떻게 나를 돌보나요?',
    '지금 딱 한 가지만 느낀다면 무엇인가요?',
    '멍한 오늘 하루를 색깔로 표현한다면?',
    '지금 이 순간 가장 하고 싶은 것이 있다면?',
    '이 멍함이 나에게 필요한 이유가 있을까요?',
    '멍한 마음 그대로 적어도 괜찮아요. 지금 드는 생각은?',
    '지금 가장 함께 있고 싶은 사람이 있나요?',
    '이 멍함이 지나고 나면 어떤 감정이 올 것 같나요?',
    '아무것도 하지 않아도 괜찮은 하루였나요?',
  ],
};

// ── 마스코트 cross-fade 컴포넌트 ───────────────────────────
function MascotImage({ emotionId }) {
  const [displaySrc, setDisplaySrc] = useState(mascotFallback);
  const [opacity, setOpacity] = useState(1);
  const prevId = useRef(null);

  useEffect(() => {
    if (emotionId === prevId.current) return;
    prevId.current = emotionId;

    setOpacity(0);
    const t = setTimeout(() => {
      const emotion = emotionId ? findEmotionById(emotionId) : null;
      setDisplaySrc(emotion?.image ?? mascotFallback);
      setOpacity(1);
    }, 150);
    return () => clearTimeout(t);
  }, [emotionId]);

  return (
    <img
      src={displaySrc}
      onError={e => { e.target.src = mascotFallback; }}
      alt="EmoLens 마스코트"
      className="dw-mascot"
      style={{ opacity, transition: 'opacity 0.15s ease' }}
    />
  );
}

const today = new Date().toISOString().split('T')[0];

export default function DiaryWritePage() {
  const navigate = useNavigate();
  const [title, setTitle]                         = useState('');
  const [date]                                    = useState(today);
  const [content, setContent]                     = useState('');
  const [selectedTemplate, setSelectedTemplate]   = useState('plain');
  const [selectedEmotions, setSelectedEmotions]   = useState([]); // [{id, score, order}]
  const [currentPrompts, setCurrentPrompts]       = useState([]);
  const [questionQueue, setQuestionQueue]         = useState([]);
  const [letterTo, setLetterTo]                   = useState('');
  const [letterFrom, setLetterFrom]               = useState('');
  const [imageUrls, setImageUrls]                 = useState([]);
  const [uploading, setUploading]                 = useState(false);
  const [submitting, setSubmitting]               = useState(false);
  const [weather, setWeather]                     = useState(null);

  const primaryEmotion = selectedEmotions.find(e => e.order === 1) ?? null;
  const primaryId      = primaryEmotion?.id ?? null;

  // 주 감정 바뀌면 질문 풀 초기화
  useEffect(() => {
    const pool = (primaryId && EMOTION_QUESTIONS[primaryId]) || GENERAL_QUESTIONS;
    const shuffled = shuffle(pool);
    setCurrentPrompts(shuffled.slice(0, 3));
    setQuestionQueue(shuffled.slice(3));
  }, [primaryId]);

  useEffect(() => {
    getCurrentWeather('Seoul')
      .then(data => setWeather({ id: data.weather[0].id }))
      .catch(() => {});
  }, []);

  const { isSupported: micSupported, isRecording, interimText, toggle: toggleMic } =
    useSpeechRecognition({
      onFinalResult: (text) =>
        setContent(prev => prev + (prev && !prev.endsWith('\n') ? ' ' : '') + text),
    });

  // ── 감정 토글 ────────────────────────────────────────────
  const handleEmotionToggle = (id) => {
    setSelectedEmotions(prev => {
      const existing = prev.find(e => e.id === id);
      if (existing) {
        return prev
          .filter(e => e.id !== id)
          .sort((a, b) => a.order - b.order)
          .map((e, i) => ({ ...e, order: i + 1 }));
      }
      if (prev.length >= 3) return prev;
      return [...prev, { id, score: 50, order: prev.length + 1 }];
    });
  };

  const handleScoreChange = (id, score) => {
    setSelectedEmotions(prev => prev.map(e => e.id === id ? { ...e, score } : e));
  };

  const handleClear = () => setSelectedEmotions([]);

  // ── 질문 교체 ───────────────────────────────────────────
  const handleNewPrompts = () => {
    const pool = (primaryId && EMOTION_QUESTIONS[primaryId]) || GENERAL_QUESTIONS;
    let queue = [...questionQueue];
    if (queue.length < 3) {
      const remaining = shuffle(pool.filter(q => !currentPrompts.includes(q)));
      queue = [...queue, ...remaining];
    }
    setCurrentPrompts(queue.slice(0, 3));
    setQuestionQueue(queue.slice(3));
  };

  // ── 이미지 업로드 ────────────────────────────────────────
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrls(prev => [...prev, url]);
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── 저장 ────────────────────────────────────────────────
  const buildContent = () => {
    if (selectedTemplate === 'letter') {
      return [letterTo && `To. ${letterTo}`, content, letterFrom && `From. ${letterFrom}`]
        .filter(Boolean).join('\n\n');
    }
    return content;
  };

  const handleSubmit = async () => {
    const finalContent = buildContent();
    if (!title.trim())        { alert('제목을 입력해주세요.'); return; }
    if (!finalContent.trim()) { alert('내용을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const emotions = selectedEmotions
        .sort((a, b) => a.order - b.order)
        .map(({ id, score, order }) => ({ emotion: id, score, order }));

      const id = await createDiary({
        title: title.trim(),
        content: finalContent,
        diaryDate: date,
        weather: getWeatherEnum(weather?.id),
        isSecret: false,
        imageUrls,
        emotions,
      });

      if (selectedEmotions.length > 0) {
        incrementEmotionUsage(selectedEmotions.map(e => e.id));
      }

      localStorage.setItem(`diary_template_${id}`, selectedTemplate);
      navigate(`/diary/${id}`);
    } catch {
      alert('일기 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const speechText = (primaryId && COMPANION_MESSAGES[primaryId]) || '오늘의 마음을\n천천히 들여다볼게요 😊';
  const primaryEmotionData = primaryId ? EMOTION_MAP[primaryId] : null;
  const today_date = new Date();

  return (
    <div className="dw-layout">
      <SidebarLeft />

      <main className="dw-main">
        <div className="dw-page-header">
          <h1 className="dw-page-title">오늘의 일기 ✍️</h1>
          <p className="dw-page-sub">감정을 먼저 고르고, 마음을 천천히 기록해보세요</p>
        </div>

        {/* ── Step 1: 감정 선택 ── */}
        <EmotionSelector
          selectedEmotions={selectedEmotions}
          onToggle={handleEmotionToggle}
          onScoreChange={handleScoreChange}
          onClear={handleClear}
        />

        {/* ── Step 2 & 3: 일기 카드 ── */}
        <div
          className="dw-card"
          style={{ backgroundColor: primaryEmotionData?.cardBg }}
        >
          <div className="dw-card-top">
            <input
              className="dw-title-input"
              type="text"
              placeholder="오늘 하루의 제목을 지어보세요"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={30}
            />
            <div className="dw-meta-row">
              <span className="dw-meta-pill">📅 {formatDate(today_date)}</span>
              {weather && (
                <span className="dw-meta-pill">
                  {getWeatherEmoji(weather.id)} {getWeatherLabel(weather.id)}
                </span>
              )}
              {selectedEmotions.length > 0 && [...selectedEmotions]
                .sort((a, b) => a.order - b.order)
                .map(({ id, order }) => {
                  const em = EMOTION_MAP[id];
                  return (
                    <span
                      key={id}
                      className="dw-meta-pill dw-emotion-pill"
                      style={{ background: em.bg, borderColor: em.border, color: '#555' }}
                    >
                      {em.emoji} {em.label}
                      {order === 1 && <span style={{ fontSize: 10, marginLeft: 2, opacity: 0.6 }}>주</span>}
                    </span>
                  );
                })}
            </div>
          </div>

          {selectedTemplate === 'letter' && (
            <div className="dw-letter-row">
              <span className="dw-letter-label">To.</span>
              <input className="dw-letter-input" type="text"
                placeholder="받는 사람 (미래의 나, 누군가에게…)"
                value={letterTo} onChange={e => setLetterTo(e.target.value)} />
            </div>
          )}

          <div className={`dw-textarea-wrap${selectedTemplate === 'notebook' ? ' notebook' : ''}`}>
            <textarea
              className="dw-content-textarea"
              placeholder={
                selectedTemplate === 'letter'
                  ? '안녕,\n\n오늘은 이런 하루를 보냈어…'
                  : '오늘 있었던 일, 느꼈던 감정, 생각을 자유롭게 적어보세요...'
              }
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={2000}
            />
            {interimText && <p className="dw-interim">{interimText}</p>}
            <span className="dw-char-count textarea-count">{content.length}/2000</span>
          </div>

          {selectedTemplate === 'letter' && (
            <div className="dw-letter-row dw-letter-from">
              <span className="dw-letter-label">From.</span>
              <input className="dw-letter-input" type="text"
                placeholder="보내는 사람"
                value={letterFrom} onChange={e => setLetterFrom(e.target.value)} />
            </div>
          )}

          {imageUrls.length > 0 && (
            <div className="dw-image-preview">
              {imageUrls.map((url, i) => {
                const src = url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
                return (
                  <div key={i} className="dw-preview-item">
                    <img src={src} alt={`첨부 이미지 ${i + 1}`} />
                    <button className="dw-preview-remove"
                      onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}>✕</button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="dw-card-footer">
            <div className="dw-card-footer-left">
              <label className={`dw-action-btn${uploading ? ' disabled' : ''}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                {uploading ? '업로드 중…' : '사진 추가'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} disabled={uploading} />
              </label>

              <button
                className={`dw-action-btn${isRecording ? ' recording' : ''}${!micSupported ? ' disabled' : ''}`}
                onClick={micSupported ? toggleMic : undefined}
                disabled={!micSupported}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                {isRecording ? '녹음 중지' : '음성 입력'}
              </button>

              <span className="dw-title-count">{title.length}/30</span>
            </div>

            <button className="dw-submit-btn" onClick={handleSubmit} disabled={submitting || uploading}>
              {submitting ? '저장 중…' : '완료하기'}
              {!submitting && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <p className="dw-footer-note">🔒 일기는 나만 볼 수 있어요. 언제든 안전하게 수정하고 들여다볼 수 있습니다.</p>
      </main>

      {/* ── 오른쪽 패널 ── */}
      <aside className="dw-panel">
        <div className="dw-companion-card">
          <div className="dw-companion-inner">
            <MascotImage emotionId={primaryId} />
            <div className="dw-speech-bubble">
              {speechText.split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </div>
          </div>

          <p className="dw-companion-label">✨ 막막하면 질문을 골라보세요</p>

          <div className="dw-prompts">
            {currentPrompts.map((prompt, i) => (
              <button key={i} className="dw-prompt-bubble"
                onClick={() => setContent(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`)}>
                {prompt}
              </button>
            ))}
          </div>

          <button className="dw-new-prompt-btn" onClick={handleNewPrompts}>
            ↻ 새 질문 받기
          </button>
        </div>

        <div className="dw-panel-card">
          <div className="dw-panel-card-header">
            <span className="dw-panel-card-title">일기 형식</span>
          </div>
          <div className="tpl-list">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                className={`tpl-item${selectedTemplate === t.id ? ' active' : ''}`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                <span className="tpl-icon">{t.icon}</span>
                <div>
                  <span className="tpl-label">{t.label}</span>
                  <span className="tpl-desc">{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="dw-panel-card dw-ai-preview">
          <div className="dw-ai-preview-header">
            <span className="dw-ai-preview-title">AI 분석 미리보기</span>
            <span className="dw-ai-preview-badge">Beta</span>
          </div>
          <p className="dw-ai-preview-text">
            일기를 완성하면 AI가 감정을 분석하고 맞춤 리포트를 제공해드려요.
          </p>
          <div className="dw-ai-preview-icon">📊</div>
        </div>
      </aside>
    </div>
  );
}
