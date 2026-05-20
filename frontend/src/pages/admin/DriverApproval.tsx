import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Car, Calendar, CreditCard, Award, CheckCircle, Search, LogOut } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import './DriverApproval.css';

interface Driver {
  userId: string;
  vehicleType: string;
  vehicleInfor: string;
  drivingLicenseInfor: string;
  japaneseCerInfor: string;
  avatarPicture: string | null;
  profile: {
    fullName: string;
    email: string;
    phone: string;
  };
}

const DriverApproval = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPendingDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/admin/pending`);
      const data = await response.json();
      if (data.success) {
        setDrivers(data.data);
      }
    } catch (error) {
      console.error('Error fetching pending drivers:', error);
      showToast('❌ Lỗi kết nối đến server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const handleApprove = async (userId: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/admin/approve/${userId}`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        showToast(`✅ Đã phê duyệt tài xế ${name}!`);
        // Refresh list
        setDrivers(prev => prev.filter(d => d.userId !== userId));
      } else {
        showToast('❌ Duyệt tài xế thất bại.');
      }
    } catch (error) {
      console.error('Error approving driver:', error);
      showToast('❌ Lỗi xảy ra khi duyệt tài xế.');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.profile.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.profile.phone.includes(searchQuery) ||
    driver.vehicleType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-approval-page">
      {/* Sidebar/Header */}
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-logo-box">
            <ShieldCheck size={28} className="admin-logo-icon" />
          </div>
          <div>
            <h1>JV-Taxi Admin</h1>
            <p>Driver Approval Portal</p>
          </div>
        </div>

        <div className="admin-search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài xế (tên, số xe, loại xe)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="admin-logout-btn" onClick={() => navigate('/login')}>
          <LogOut size={16} />
          <span>Thoát</span>
        </button>
      </header>

      <main className="admin-main-content">
        <div className="admin-page-title-row">
          <div>
            <h2>Yêu cầu duyệt tài xế mới</h2>
            <p>Xem xét hồ sơ, thông tin xe, bằng lái và chứng chỉ Nhật ngữ (JLPT) để phê duyệt hoạt động.</p>
          </div>
          <div className="admin-stats-badge">
            <span className="stats-number">{filteredDrivers.length}</span>
            <span className="stats-label">Đang chờ</span>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-spinner" />
            <p>Đang tải danh sách tài xế...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="admin-empty-state">
            <CheckCircle size={64} className="empty-icon" />
            <h3>Không có yêu cầu chờ duyệt</h3>
            <p>Tất cả tài xế đăng ký trên hệ thống đều đã được phê duyệt.</p>
          </div>
        ) : (
          <div className="admin-drivers-grid">
            {filteredDrivers.map(driver => {
              // Parse vehicle information
              let vehicle = { model: 'BMW', plate: 'N/A', year: '2022', image: null };
              try {
                if (driver.vehicleInfor) {
                  vehicle = JSON.parse(driver.vehicleInfor);
                }
              } catch (e) {
                // ignore parsing issues
              }

              return (
                <div key={driver.userId} className="admin-driver-card">
                  {/* Top Header Card */}
                  <div className="driver-card-top">
                    <div className="driver-avatar-box">
                      <img 
                        src={driver.avatarPicture || vehicle.image || "https://placehold.co/100x100?text=Driver"} 
                        alt={driver.profile.fullName} 
                        className="driver-avatar-img"
                      />
                    </div>
                    <div className="driver-main-details">
                      <h3 className="driver-name">{driver.profile.fullName}</h3>
                      <p className="driver-contact">{driver.profile.phone} • {driver.profile.email}</p>
                      
                      <div className="jlpt-badge-wrapper">
                        <span className={`jlpt-badge ${driver.japaneseCerInfor ? 'has-jlpt' : 'no-jlpt'}`}>
                          <Award size={14} />
                          Chứng chỉ: {driver.japaneseCerInfor || 'Chưa cung cấp'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info sections */}
                  <div className="driver-card-sections">
                    {/* Vehicle Info */}
                    <div className="card-section">
                      <div className="section-title">
                        <Car size={16} className="section-icon" />
                        <span>Thông tin phương tiện</span>
                      </div>
                      <div className="section-body">
                        <div className="info-item">
                          <span className="info-label">Dòng xe:</span>
                          <span className="info-value">{vehicle.model} ({driver.vehicleType})</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Biển kiểm soát:</span>
                          <span className="info-value text-highlight">{vehicle.plate}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Năm sản xuất:</span>
                          <span className="info-value">{vehicle.year}</span>
                        </div>
                      </div>
                    </div>

                    {/* Driving License */}
                    <div className="card-section">
                      <div className="section-title">
                        <CreditCard size={16} className="section-icon" />
                        <span>Giấy phép lái xe</span>
                      </div>
                      <div className="section-body">
                        <div className="info-item">
                          <span className="info-label">Thông tin GPLX:</span>
                          <span className="info-value">{driver.drivingLicenseInfor || 'N/A'}</span>
                        </div>
                        {driver.avatarPicture && (
                          <div className="info-img-link">
                            <a href={driver.avatarPicture} target="_blank" rel="noreferrer">
                              Xem hình ảnh đính kèm ↗
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Approve action */}
                  <div className="driver-card-footer">
                    <button 
                      className="admin-approve-btn"
                      onClick={() => handleApprove(driver.userId, driver.profile.fullName)}
                    >
                      <UserCheck size={18} />
                      <span>Phê duyệt tài xế</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default DriverApproval;
