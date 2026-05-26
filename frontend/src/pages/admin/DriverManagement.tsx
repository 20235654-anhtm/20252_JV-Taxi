import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './DriverManagement.css';

// Lucide React Icons
import {
  Users,
  CheckCircle,
  Clock,
  WifiOff,
  Search,
  Award,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Star,
  Check
} from 'lucide-react';

import AdminBottomNavBar from '../../components/layout/AdminBottomNavBar';

interface Driver {
  id: string;
  fullName: string;
  driverId: string;
  rating: number | null; // Nullable if no database rating is set
  vehicleName: string;
  status: 'active' | 'carrying' | 'offline'; // active = waiting/available, carrying = busy, offline
  avatar: string;
  japaneseCert?: string | null; // Nullable if no database certificate is set
  destination?: string;
  lastActive?: string;
  email?: string;
  phone?: string;
  rawProfile?: any; // To pass in state to details page if needed
}

const DriverManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLang, setActiveLang] = useState<'JP' | 'VN'>('JP');

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch drivers from backend on mount
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/admin/users?role=DRIVER&limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const mappedDrivers: Driver[] = data.data.map((user: any) => {
            // Parse vehicleInfo - default to "未設定" instead of mock values
            let vehicleModel = "";
            let plateNumber = "";
            let destination = "";

            try {
              if (user.driverProfile?.vehicleInfor) {
                const parsed = JSON.parse(user.driverProfile.vehicleInfor);
                vehicleModel = parsed.model || "";
                plateNumber = parsed.plate || "";
                destination = parsed.destination || "";
              }
            } catch (e) {
              // Ignore JSON parse errors
            }

            // Determine status
            let status: 'active' | 'carrying' | 'offline' = 'offline';
            if (user.driverProfile?.isOnline) {
              status = user.driverProfile?.isBusy ? 'carrying' : 'active';
            }

            // Determine JLPT Cert
            const jlpt = user.driverProfile?.japaneseCerInfor || null;

            // Calculate lastActive relative time string from real database last_active
            let lastActiveStr = "未アクティブ";
            if (user.lastActive) {
              const lastActiveDate = new Date(user.lastActive);
              const now = new Date();
              const diffMs = now.getTime() - lastActiveDate.getTime();
              if (!isNaN(diffMs) && diffMs >= 0) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                if (diffMins < 1) {
                  lastActiveStr = "たった今";
                } else if (diffMins < 60) {
                  lastActiveStr = `${diffMins}分前`;
                } else {
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  if (diffHours < 24) {
                    lastActiveStr = `${diffHours}時間前`;
                  } else {
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    if (diffDays < 30) {
                      lastActiveStr = `${diffDays}日前`;
                    } else {
                      const y = lastActiveDate.getFullYear();
                      const m = lastActiveDate.getMonth() + 1;
                      const d = lastActiveDate.getDate();
                      lastActiveStr = `${y}/${m}/${d}`;
                    }
                  }
                }
              }
            } else {
              // Fallback to static lastActive parsed if no user.lastActive (compatibility)
              try {
                if (user.driverProfile?.vehicleInfor) {
                  const parsed = JSON.parse(user.driverProfile.vehicleInfor);
                  if (parsed.lastActive) {
                    lastActiveStr = parsed.lastActive;
                  }
                }
              } catch (e) {
                // ignore
              }
            }

            return {
              id: user.id,
              fullName: user.fullName || 'Unknown',
              driverId: plateNumber || "未登録",
              rating: user.driverProfile?.averageRating ? parseFloat(Number(user.driverProfile.averageRating).toFixed(2)) : null,
              vehicleName: vehicleModel || "未登録",
              status: status,
              avatar: user.avatar || (user.fullName?.toLowerCase().includes('thi') 
                ? `https://avatar.iran.liara.run/public/girl?username=${user.id}` 
                : `https://avatar.iran.liara.run/public/boy?username=${user.id}`),
              japaneseCert: jlpt,
              destination: destination,
              lastActive: lastActiveStr,
              email: user.email || '',
              phone: user.phone || '',
              rawProfile: user
            };
          });

          setDrivers(mappedDrivers);
        } else {
          setDrivers([]);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Filter drivers based on search query (name, ID/Plate, or vehicle)
  const filteredDrivers = drivers.filter(driver => {
    const q = searchQuery.toLowerCase();
    return (
      driver.fullName.toLowerCase().includes(q) ||
      driver.driverId.toLowerCase().includes(q) ||
      driver.vehicleName.toLowerCase().includes(q)
    );
  });

  // Dynamic statistics calculations
  const totalCount = drivers.length;
  // Active = online & available (waiting)
  const activeCount = drivers.filter(d => d.status === 'active').length;
  // Carrying = online & busy (in trip)
  const carryingCount = drivers.filter(d => d.status === 'carrying').length;
  // Offline = not online
  const offlineCount = drivers.filter(d => d.status === 'offline').length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDrivers = filteredDrivers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Navigate to driver details and block page
  const handleCardClick = (driver: Driver) => {
    // Construct exact normalized Driver structure expected by DriverReviewDetail.tsx
    const rawDriver = {
      userId: driver.id,
      vehicleType: driver.rawProfile?.driverProfile?.vehicleType || '',
      vehicleInfor: driver.rawProfile?.driverProfile?.vehicleInfor || JSON.stringify({
        model: driver.vehicleName !== "未登録" ? driver.vehicleName : "",
        plate: driver.driverId !== "未登録" ? driver.driverId : "",
        year: '2022',
        class: driver.status === 'active' ? 'premium' : 'standard'
      }),
      drivingLicenseInfor: driver.rawProfile?.driverProfile?.drivingLicenseInfor || (driver.japaneseCert ? `Kinh nghiệm: 8 năm` : `Kinh nghiệm: 5 năm`),
      japaneseCerInfor: driver.rawProfile?.driverProfile?.japaneseCerInfor || driver.japaneseCert || '',
      avatarPicture: driver.avatar || null,
      profile: {
        fullName: driver.fullName,
        email: driver.email || '',
        phone: driver.phone || ''
      },
      isApproved: driver.rawProfile?.driverProfile?.isApproved || false
    };

    navigate('/admin/driver-management/driver-detail', { state: { driver: rawDriver } });
  };

  return (
    <div className="driver-management-container">
      {/* Header */}
      <header className="driver-header">
        <div className="header-brand">
          JV - Taxi 管理者
        </div>
        <div className="header-lang-switch">
          <button
            type="button"
            className={`lang-btn ${activeLang === 'JP' ? 'active' : ''}`}
            onClick={() => setActiveLang('JP')}
          >
            JP
          </button>
          <button
            type="button"
            className={`lang-btn ${activeLang === 'VN' ? 'active' : ''}`}
            onClick={() => setActiveLang('VN')}
          >
            VN
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="driver-management-content">
        {/* Statistics cards grid */}
        <div className="stats-grid">
          {/* Card 1: Total drivers */}
          <div className="stat-card total">
            <div className="stat-icon-wrapper">
              <Users className="stat-icon" />
            </div>
            <div>
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">総ドライバー数</div>
            </div>
          </div>

          {/* Card 2: Active drivers */}
          <div className="stat-card active">
            <div className="stat-icon-wrapper">
              <CheckCircle className="stat-icon" />
            </div>
            <div>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-label">現在アクティブ</div>
            </div>
          </div>

          {/* Card 3: Carrying drivers */}
          <div className="stat-card carrying">
            <div className="stat-icon-wrapper">
              <Clock className="stat-icon" />
            </div>
            <div>
              <div className="stat-value">{carryingCount}</div>
              <div className="stat-label">乗車中</div>
            </div>
          </div>

          {/* Card 4: Offline drivers */}
          <div className="stat-card offline">
            <div className="stat-icon-wrapper">
              <WifiOff className="stat-icon" />
            </div>
            <div>
              <div className="stat-value">{offlineCount}</div>
              <div className="stat-label">オフライン</div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="search-bar-wrapper">
          <Search className="search-icon-left" size={20} />
          <input
            type="text"
            className="search-bar-input"
            placeholder="名前、ID、または車両でドライバーを検索"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value.slice(0, 200));
              setCurrentPage(1); // Reset to page 1 on search
            }}
            maxLength={200}
          />
        </div>

        {/* Driver List */}
        <div className="drivers-list-container">
          {loading ? (
            <div className="loading-wrapper">
              <div className="loading-spinner" />
              <p>読み込み中...</p>
            </div>
          ) : currentDrivers.length > 0 ? (
            currentDrivers.map((driver) => (
              <div
                key={driver.id}
                className="driver-card-item"
                onClick={() => handleCardClick(driver)}
              >
                {/* Top Section */}
                <div className="driver-card-top-row">
                  <div className="driver-avatar-wrapper">
                    <img
                      src={driver.avatar}
                      alt={driver.fullName}
                      className="driver-squircle-avatar"
                    />
                    <span className={`driver-status-dot-badge ${driver.status}`} />
                  </div>

                  <div className="driver-meta-column">
                    <h3 className="driver-name-text">{driver.fullName}</h3>
                    <p className="driver-id-text">{driver.driverId}</p>

                    {/* Rating Badge - conditionally render only if there is a real rating */}
                    {driver.rating !== null && (
                      <div className={`driver-rating-badge ${driver.rating >= 4.8 ? 'high-rating' : 'standard-rating'}`}>
                        {driver.rating === 5.0 ? (
                          <Check className="rating-star-icon" size={12} strokeWidth={3} />
                        ) : (
                          <Star className="rating-star-icon" size={12} />
                        )}
                        <span className="rating-value-text">{driver.rating.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle: Vehicle details */}
                <div className="driver-card-vehicle-section">
                  <span className="vehicle-label-text">車両</span>
                  <p className="vehicle-name-value">{driver.vehicleName}</p>
                </div>

                {/* Bottom: Dynamic Info based on status */}
                {driver.status === 'active' && driver.japaneseCert && (
                  <div className="driver-card-dynamic-block jlpt-block">
                    <div className="dynamic-icon-box">
                      <Award size={18} />
                    </div>
                    <div className="dynamic-info-column">
                      <span className="dynamic-label-text">JLPT認定</span>
                      <span className="dynamic-value-text">{driver.japaneseCert}</span>
                    </div>
                  </div>
                )}

                {driver.status === 'carrying' && driver.destination && (
                  <div className="driver-card-dynamic-block destination-block">
                    <div className="dynamic-icon-box">
                      <Navigation size={18} />
                    </div>
                    <div className="dynamic-info-column">
                      <span className="dynamic-label-text">目的地</span>
                      <span className="dynamic-value-text">{driver.destination}</span>
                    </div>
                  </div>
                )}

                {driver.status === 'offline' && driver.lastActive && (
                  <div className="driver-card-dynamic-block offline-block">
                    <div className="dynamic-icon-box">
                      <Clock size={18} />
                    </div>
                    <div className="dynamic-info-column">
                      <span className="dynamic-label-text">最終アクティブ</span>
                      <span className="dynamic-value-text">{driver.lastActive}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-search-state">
              <Search size={40} />
              <p>検索結果が見つかりませんでした。</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-row">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous Page"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="pagination-text">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next Page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Admin Bottom Navigation Bar */}
      <AdminBottomNavBar />
    </div>
  );
};

export default DriverManagement;
