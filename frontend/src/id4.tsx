import { useState, useEffect } from 'react';
import './id4.css';
import { Header } from './components/layout/Header';
import { useNavigate } from 'react-router-dom';
interface Driver {
  id: number;
  name: string;
  car: string;
  distance: string;
  time: string;
  price: string;
  rating: number;
  avatar: string;
}

const ID4 = () => {
  // 1. Tạo "kho" chứa dữ liệu trống lúc ban đầu
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
const navigate = useNavigate();
  // 2. Dùng useEffect để tự động gọi sang Backend lấy dữ liệu
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/drivers');
        const data = await response.json();
        
        if (data.success) {
          setDrivers(data.data);
        }
      } catch (error) {
        console.error("Lỗi khi kết nối Backend:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchDrivers();
  }, []);  
  return (
  <div className="app-container">

   <Header
  variant="passenger"
  showBackButton={true}
  title="ドライバー選択"
  onBackClick={() => navigate(-1)}
/>

      <div className="content">
        <div className="status-row flex items-center justify-between">
  <div className="status-title flex items-center gap-2">
    <span className="dot w-3 h-3 bg-[#006d37] rounded-full flex-shrink-0"></span>
    <span className="text-[#064e3b] font-bold leading-none flex items-center">
      周辺のドライバー (3km圏内)
    </span>
  </div>
  <div className="live-badge bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-500">
    ライブ更新
  </div>
</div>

        {}
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải dữ liệu từ Backend...</div>
        ) : (
          <div className="driver-list">
            {drivers.map((driver) => (
              <div className="driver-card" key={driver.id}>
                <div className="card-top">
                  
                  <div className="driver-info">
                    <div className="avatar-wrapper">
                      <img src={driver.avatar} alt={driver.name} className="avatar" />
                      <div className="rating">
                        <span className="star">★</span> {driver.rating}
                      </div>
                    </div>
                    
                    <div className="driver-details">
                      <h3>{driver.name}</h3>
<p className="car-model">{driver.car}</p>
                      <div className="tags">
                        <span className="tag">{driver.distance}</span>
                        <span className="tag">{driver.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="price-info">
                    <p className="price">₫{driver.price}</p>
                    <p className="price-label">合計予想金額</p>
                  </div>

                </div>
                <button 
  className="select-btn" 
  onClick={() => {
    console.log("Đã bấm nút!"); 
    navigate('/passenger');   
  }}
>
  選択する 〉
</button>
              </div>
            ))}
          </div>
        )}
        <div className="loading-footer">
          <div className="spinner"></div>
          <p>ドライバーをさらに検索中...</p>
        </div>
      </div>
    </div>
  );
}

export default ID4;
