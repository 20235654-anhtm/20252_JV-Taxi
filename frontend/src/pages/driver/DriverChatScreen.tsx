import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Send, Phone } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import '../../pages/passenger/ChatScreen.css'; // Reuse same styles

interface Message {
  id: string;
  senderId: string;
  senderName: string | null;
  content: string;
  createdAt: string;
}

const API_BASE = 'http://localhost:5000/api';

const DriverChatScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useSocket();

  const passenger = location.state?.passenger;
  const rideId = location.state?.rideId;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!rideId) return;
    fetch(`${API_BASE}/messages/${rideId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setMessages(data.data); })
      .catch(console.error);
  }, [rideId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !rideId) return;
    socket.emit('join_ride', rideId);

    socket.on('new_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('user_typing', ({ userId }: { userId: string }) => {
      if (userId !== myId) {
        setIsTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    });
    return () => { socket.off('new_message'); socket.off('user_typing'); };
  }, [socketRef, rideId, myId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !rideId) return;
    socketRef.current?.emit('send_message', { rideId, content: trimmed });
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <div className="chat-header-avatar">
          <img src={`https://i.pravatar.cc/80?u=${passenger?.name}`} alt={passenger?.name}
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40'; }} />
          <span className="chat-online-dot"></span>
        </div>
        <h2 className="chat-header-name">{passenger?.name || 'Hành khách'}</h2>
        <div className="chat-header-actions">
          <a href={`tel:${passenger?.phone}`} className="chat-header-btn"><Phone size={20} /></a>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => {
          const isMine = msg.senderId === myId;
          return (
            <div key={msg.id} className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
              <div className={`chat-bubble ${isMine ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}>
                {msg.content}
              </div>
              <span className="chat-time">
                {new Date(msg.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                {isMine && <span className="chat-read-tick"> ✓</span>}
              </span>
            </div>
          );
        })}
        {isTyping && (
          <div className="chat-bubble-row theirs">
            <div className="chat-bubble chat-bubble-theirs chat-typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <input
          type="text"
          className="chat-input"
          placeholder="メッセージを入力..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={() => socketRef.current?.emit('typing', { rideId })}
        />
        <button className={`chat-send-btn ${inputText.trim() ? 'active' : ''}`} onClick={handleSend} disabled={!inputText.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default DriverChatScreen;
