import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, Languages, Send, CheckCheck } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Heading } from '../../components/ui/Heading';
import './ChatwithPassenger.css';

interface Message {
  id: string;
  sender: 'driver' | 'passenger';
  text: string;
  translatedText?: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const ChatwithPassenger: React.FC = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'driver',
      text: 'こんにちは！お迎えに向かっています。オペラハウス付近で少し渋滞しています。',
      translatedText: 'Xin chào! Tôi đang trên đường đến đón bạn. Gần Nhà hát Lớn đang hơi kẹt xe một chút.',
      time: '14:02',
      status: 'read'
    },
    {
      id: '2',
      sender: 'passenger',
      text: 'お知らせありがとうございます。メインエントランスで待っています。',
      translatedText: 'Cảm ơn bạn đã thông báo. Tôi đang đợi ở cổng chính.',
      time: '14:05',
      status: 'read'
    },
    {
      id: '3',
      sender: 'driver',
      text: '到着しました。白いトヨタ・カムリ、ナンバー 51G-12345 です。',
      translatedText: 'Tôi đã đến nơi. Xe Toyota Camry màu trắng, biển số 51G-12345.',
      time: '14:08'
    }
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'driver', // Driver is sending the message
      text: inputText,
      translatedText: inputText + ' (Dịch: ' + inputText + ')', // Mock translation
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const handleBack = () => {
    navigate('/driver/in-trip');
  };

  return (
    <div className="chat-container">
      {/* Custom Header to match Figma exactly */}
      <header className="fixed top-0 left-0 right-0 h-16 z-[1000] bg-[rgba(255,255,255,0.8)] backdrop-blur-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between h-full px-6 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft size={20} className="text-[#065F46]" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=passenger" 
                  borderColor="transparent"
                />
                <div className="absolute bottom-0 right-0 w-[12px] h-[12px] bg-[#27AE60] border-2 border-[#F4FBF1] rounded-full"></div>
              </div>
              <Heading level={2} className="!text-[16px] !font-bold !text-[#064E3B]">Nguyen Tan</Heading>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-icon-btn" onClick={() => navigate('/driver/call-passenger')}>
              <Phone size={18} fill="currentColor" />
            </button>
            <button className="action-icon-btn" onClick={() => setIsTranslated(!isTranslated)}>
              <Languages size={22} className={isTranslated ? 'text-[#27ae60]' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="chat-messages">
        <div className="date-separator">
          <span className="date-tag">今日</span>
        </div>

        {messages.map((msg) => {
          const isSelf = msg.sender === 'driver';
          return (
            <div key={msg.id} className={`message-group ${isSelf ? 'self' : 'other'}`}>
              <div className="chat-bubble">
                {isTranslated && msg.translatedText ? msg.translatedText : msg.text}
              </div>
              <div className="message-meta">
                <span className="time-text">{msg.time}</span>
                {isSelf && msg.status === 'read' && (
                  <div className="status-icon">
                    <CheckCheck size={14} color="#006D37" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Input Area */}
      <div className="chat-input-wrapper">
        <div className="chat-input-container">
          <input 
            type="text" 
            className="chat-input-field" 
            placeholder="メッセージを入力..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-button" onClick={handleSend}>
            <Send size={19} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatwithPassenger;
