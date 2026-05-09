import { useState, useEffect } from 'react';
import './id4.css';


// Định nghĩa khung dữ liệu để TypeScript không báo lỗi
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

  // 2. Dùng useEffect để tự động gọi sang Backend lấy dữ liệu
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        // Gọi thẳng vào API bạn vừa tạo
        const response = await fetch('http://localhost:5000/api/drivers');
        const data = await response.json();
        
        if (data.success) {
          // Nếu thành công, nhét dữ liệu lấy được vào "kho"
          setDrivers(data.data);
        }
      } catch (error) {
        console.error("Lỗi khi kết nối Backend:", error);
      } finally {
        setLoading(false); // Báo hiệu đã tải xong
      }
    };

    fetchDrivers();
  }, []); // Dấu [] trống nghĩa là chỉ gọi API 1 lần duy nhất khi mở app

  return (
    <div className="app-container">
      {/* Thanh Header mờ */}
      <div className="header">
        <span className="back-icon">←</span>
        <h2>ドライバー選択</h2>
      </div>

      <div className="content">
        <div className="status-row">
          <div className="status-title">
            <span className="dot"></span>
            周辺のドライバー (3km圏内)
          </div>
          <div className="live-badge">ライブ更新</div>
        </div>

        {/* Nếu đang tải thì hiện chữ, tải xong thì hiện danh sách */}
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
                
                <button className="select-btn">
                  選択する <span className="arrow">〉</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Loading Spinner mờ mờ ở dưới cùng */}
        <div className="loading-footer">
          <div className="spinner"></div>
          <p>ドライバーをさらに検索中...</p>
        </div>
      </div>
    </div>
  );
}

export default ID4;