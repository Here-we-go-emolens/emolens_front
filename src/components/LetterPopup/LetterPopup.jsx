import { useNavigate } from 'react-router-dom';
import mascotImg from '../../assets/mascot-removebg-preview.png';
import './LetterPopup.css';

export default function LetterPopup({ characterName, letterId, onClose }) {
  const navigate = useNavigate();

  const senderName = characterName || 'AI 친구';

  const handleRead = () => {
    onClose();
    navigate('/letters', { state: { openLetterId: letterId } });
  };

  return (
    <div className="lp-overlay" onClick={onClose}>
      <div className="lp-card" onClick={(e) => e.stopPropagation()}>

        <div className="lp-mascot-wrap">
          <img src={mascotImg} alt="" className="lp-mascot" />
        </div>

        <div className="lp-badge">💌 새 편지 도착</div>

        <h3 className="lp-title">
          <span className="lp-sender">{senderName}</span>가<br />
          어제 일기를 읽고 답장을 보냈어요!
        </h3>

        <p className="lp-hint">편지함에서 확인해보세요.</p>

        <div className="lp-btns">
          <button className="lp-btn-later" onClick={onClose}>나중에 읽기</button>
          <button className="lp-btn-go" onClick={handleRead}>편지 읽기 →</button>
        </div>

      </div>
    </div>
  );
}
