import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Phone, Languages, Send, CheckCheck } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Heading } from '../../components/ui/Heading';
import { socketService } from '../../services/socketService';
import { API_BASE_URL } from '../../config/api';
import { translateText } from '../../services/translationService';
import { showToast } from '../../components/ui/Toast';
import './ChatwithDriver.css';

interface Message {
  id: string;
  sender: 'driver' | 'passenger';
  text: string;
  translatedText?: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const ChatwithDriver: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedDriverStr = sessionStorage.getItem('active_driver');
  const driver = location.state?.driver || (storedDriverStr ? JSON.parse(storedDriverStr) : {
    name: 'Tài xế',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver'
  });
  const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user') || '{}';
  const user = JSON.parse(userStr);
  const userId = user.id;

  const [inputText, setInputText] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const isTranslatedRef = React.useRef(isTranslated);
  React.useEffect(() => {
    isTranslatedRef.current = isTranslated;
  }, [isTranslated]);

  const messagesRef = React.useRef(messages);
  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const driverRef = React.useRef(driver);
  React.useEffect(() => {
    driverRef.current = driver;
  }, [driver]);

  React.useEffect(() => {
    if (!rideId) {
      showToast('Không tìm thấy thông tin chuyến đi. Vui lòng quay lại màn hình chính.', 'error');
      navigate('/passenger');
      return;
    }

    // Fetch message history
    const fetchMessages = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/api/messages/${rideId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const loadedMessages = data.data.map((m: any) => ({
            id: m.id,
            sender: m.senderId === userId ? 'passenger' : 'driver',
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read'
          }));
          setMessages(loadedMessages);

          // Auto-translate already fetched messages if translation is already active
          if (isTranslatedRef.current) {
            loadedMessages.forEach((msg: any) => {
              translateText(msg.text).then(translated => {
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, translatedText: translated } : m));
              });
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    fetchMessages();

    // Ensure socket is connected
    socketService.connect(userId);

    // Join room
    socketService.joinChat(rideId);

    // Listen for incoming messages
    socketService.onReceiveMessage((msg) => {
      // Avoid duplicate if we just sent it
      if (msg.senderId === userId) return;

      // Check if driver has arrived
      if (msg.text === 'ドライバーが到着しました') {
        sessionStorage.setItem('driver_arrived', 'true');
        showToast('ドライバーが到着しました！', 'success');
      }

      const incoming: Message = {
        id: msg.id,
        sender: 'driver',
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered'
      };
      
      setMessages(prev => [...prev, incoming]);

      // Auto-translate if enabled
      if (isTranslatedRef.current) {
        translateText(msg.text).then(translated => {
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, translatedText: translated } : m));
        });
      }
    });

    // Listen for ride completion
    socketService.onRideCompleted((data) => {
      console.log('🏁 Ride completed successfully (received in Chat)!', data);
      showToast('目的地に到着しました。ご利用ありがとうございました。', 'success');
      
      // Clear active ride session
      sessionStorage.removeItem('active_ride_id');
      sessionStorage.removeItem('active_driver');
      sessionStorage.removeItem('driver_arrived');
      
      // Redirect to rating page
      navigate('/passenger/rate-trip', { state: { driver: driverRef.current, rideId } });
    });

    return () => {
      socketService.offReceiveMessage();
      socketService.offRideCompleted();
    };
  }, [rideId, userId, navigate]);

  // Effect to re-translate existing messages when toggle is turned on
  React.useEffect(() => {
    if (isTranslated) {
      messagesRef.current.forEach(msg => {
        if (!msg.translatedText) {
          translateText(msg.text).then(translated => {
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, translatedText: translated } : m));
          });
        }
      });
    }
  }, [isTranslated]);

  const handleSend = async () => {
    const textToTranslate = inputText.trim();
    if (!textToTranslate) return;

    // Detect target language to show appropriate loader
    const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(textToTranslate);
    const loadingText = hasJapanese ? 'Đang dịch...' : '翻訳中...';
    
    const messageId = Date.now().toString();
    const newMessage: Message = {
      id: messageId,
      sender: 'passenger',
      text: textToTranslate,
      translatedText: loadingText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Send via socket
    if (rideId) {
      socketService.sendMessage({
        rideId,
        senderId: userId,
        text: textToTranslate
      });
    }

    try {
      const translated = await translateText(textToTranslate);
      setMessages(prev =>
        prev.map(msg => msg.id === messageId ? { ...msg, translatedText: translated } : msg)
      );
    } catch (err) {
      console.error(err);
      setMessages(prev =>
        prev.map(msg => msg.id === messageId ? { ...msg, translatedText: `[Err: ${textToTranslate}]` } : msg)
      );
    }
  };

  const handleBack = () => {
    // Nếu đến từ lịch sử chuyến đi, quay về trang chi tiết chuyến đi
    if (location.state?.from === 'history') {
      navigate(`/passenger/history/${rideId}`);
      return;
    }

    // Nếu đang trong chuyến đi hoạt động
    const driverArrived = sessionStorage.getItem('driver_arrived') === 'true';
    if (driverArrived) {
      navigate('/passenger/in-trip', {
        state: {
          rideId,
          driver
        }
      });
    } else {
      navigate('/passenger/waiting-driver-pickup', {
        state: {
          rideId,
          driver
        }
      });
    }
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
                  src={driver.avatar} 
                  name={driver.name}
                  borderColor="transparent"
                />
                <div className="absolute bottom-0 right-0 w-[12px] h-[12px] bg-[#27AE60] border-2 border-[#F4FBF1] rounded-full"></div>
              </div>
              <Heading level={2} className="!text-[16px] !font-bold !text-[#064E3B]">{driver.name}</Heading>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-icon-btn" onClick={() => navigate('/passenger/call-driver', { state: location.state })}>
              <Phone size={18} fill="currentColor" />
            </button>
            <button 
              className="action-icon-btn" 
              onClick={() => setIsTranslated(!isTranslated)}
              style={isTranslated ? { backgroundColor: 'rgba(39, 174, 150, 0.1)' } : {}}
            >
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

        {messages.map((msg) => (
          <div key={msg.id} className={`message-group ${msg.sender}`}>
            <div className="chat-bubble">
              {isTranslated && msg.translatedText ? msg.translatedText : msg.text}
            </div>
            <div className="message-meta">
              <span className="time-text">{msg.time}</span>
              {msg.sender === 'passenger' && msg.status === 'read' && (
                <div className="status-icon">
                  <CheckCheck size={14} color="#006D37" />
                </div>
              )}
            </div>
          </div>
        ))}
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

export default ChatwithDriver;
