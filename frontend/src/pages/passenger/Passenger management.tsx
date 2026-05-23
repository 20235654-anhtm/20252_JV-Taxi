import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './Passenger management.css';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { SearchInput } from '../../components/ui/SearchInput';

import { LayoutDashboard, CarFront, Users, ShieldCheck } from 'lucide-react';


interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  rides: number;
  status: 'active' | 'pending' | 'suspended';
  statusText: string;
}

const PassengerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLang, setActiveLang] = useState<'JP' | 'VN'>('JP');
  const [activeNavTab, setActiveNavTab] = useState<'overview' | 'driver' | 'user' | 'approval'>('user');

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/admin/users?role=CUSTOMER&limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success && data.data) {
          const mappedPassengers: Passenger[] = data.data.map((user: any) => {
            let status: 'active' | 'pending' | 'suspended' = 'active';
            let statusText = 'アクティブ'; // Default active

            if (user.status === 'BANNED') {
              status = 'suspended';
              statusText = '停止中';
            } else if (user.status === 'INACTIVE') {
              status = 'pending';
              statusText = '保留中';
            }

            return {
              id: user.id,
              name: user.fullName || 'Unknown',
              email: user.email || '',
              phone: user.phone || '',
              avatarUrl: '', // Not provided by the API currently
              rides: 0, // Placeholder as backend does not return rides yet
              status: status,
              statusText: statusText
            };
          });
          setPassengers(mappedPassengers);
        }
      } catch (error) {
        console.error('Error fetching passengers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPassengers();
  }, []);

  // Lọc danh sách hành khách theo từ khóa tìm kiếm (Tên hoặc Email)
  const filteredPassengers = passengers.filter(passenger =>
    passenger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    passenger.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="passenger-management-container">
      { }
      <div style={{
        width: '100%',
        height: '64px',
        paddingLeft: '24px',
        paddingRight: '24px',
        left: '0px',
        top: '0px',
        position: 'fixed',
        background: 'rgba(255, 255, 255, 0.80)',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(6px)',
        justifyContent: 'space-between',
        alignItems: 'center',
        display: 'flex',
        zIndex: 1000
      }}>
        {/* Left: Title */}
        <div style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '16px',
          display: 'flex'
        }}>
          <div style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            display: 'inline-flex'
          }}>
            <div style={{
              minWidth: '163px',
              height: '28px',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: '#064E3B',
              fontSize: '20px',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 800,
              lineHeight: '28px',
              wordWrap: 'break-word'
            }}>
              JV - Taxi 管理者
            </div>
          </div>
        </div>

        {/* Right: Language Switcher */}
        <div style={{
          padding: '4px',
          background: 'rgba(244, 244, 245, 0.80)',
          borderRadius: '9999px',
          outline: '1px rgba(192, 201, 187, 0.10) solid',
          outlineOffset: '-1px',
          justifyContent: 'flex-start',
          alignItems: 'center',
          display: 'flex'
        }}>
          <div style={{
            padding: '2px',
            background: 'rgba(255, 255, 255, 0.50)',
            borderRadius: '9999px',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '2px',
            display: 'flex'
          }}>
            {/* JP Button (Active) */}
            <button
              type="button"
              onClick={() => setActiveLang('JP')}
              aria-label="Switch to Japanese"
              aria-pressed={activeLang === 'JP'}
              style={{
                width: 'auto',
                minWidth: '33px',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: activeLang === 'JP' ? '#1B5E20' : 'transparent',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                borderRadius: '9999px',
                border: 'none',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                cursor: 'pointer'
              }}>
              <div style={{
                textAlign: 'center',
                color: activeLang === 'JP' ? 'white' : '#41493E',
                fontSize: '11px',
                fontFamily: 'Inter',
                fontWeight: 700,
                lineHeight: '16px'
              }}>
                JP
              </div>
            </button>

            {/* VN Button (Inactive) */}
            <button
              type="button"
              onClick={() => setActiveLang('VN')}
              aria-label="Switch to Vietnamese"
              aria-pressed={activeLang === 'VN'}
              style={{
                width: 'auto',
                minWidth: '32px',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                borderRadius: '9999px',
                border: 'none',
                background: activeLang === 'VN' ? '#1B5E20' : 'transparent',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                cursor: 'pointer'
              }}>
              <div style={{
                textAlign: 'center',
                color: activeLang === 'VN' ? 'white' : '#41493E',
                fontSize: '11px',
                fontFamily: 'Inter',
                fontWeight: 500,
                lineHeight: '16px'
              }}>
                VN
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Khu vực nội dung chính */}
      <div className="passenger-management-content" style={{ paddingTop: '80px' }}>
        {/* Thanh tìm kiếm */}
        <div className="passenger-search-input-wrapper">
          <SearchInput
            className="passenger-search-input"
            placeholder="名前またはメールアドレスで検索…"
            value={searchQuery}
            onValueChange={(v) => setSearchQuery(v.slice(0, 200))}
            maxLength={200}
          />
        </div>

        {/* Danh sách thẻ hành khách đã qua bộ lọc */}
        <div className="passenger-cards-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Đang tải dữ liệu...</div>
          ) : filteredPassengers.length > 0 ? (
            filteredPassengers.map((passenger) => (
              <Card key={passenger.id} className="passenger-card-item">

                {/* Vùng thông tin cá nhân (Avatar + Name + Email + Phone) */}
                <div className="passenger-profile-section">
                  {passenger.avatarUrl ? (
                    <Avatar
                      src={passenger.avatarUrl}
                      size="56"
                      className={`passenger-avatar passenger-avatar-${passenger.status}`}
                    />
                  ) : (
                    <div className="passenger-avatar passenger-avatar-placeholder">
                      {passenger.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="passenger-info-text">
                    <Heading level={3} className="passenger-name">
                      {passenger.name}
                    </Heading>
                    <Text className="passenger-email">
                      {passenger.email}
                    </Text>
                    <Text className="passenger-phone">
                      {passenger.phone}
                    </Text>
                  </div>
                </div>

                {/* Hộp thông số bên dưới (Số chuyến đi & Trạng thái hoạt động) */}
                <div className="passenger-stats-row">

                  {/* Cột hiển thị số lượt đi (乗車) */}
                  <div className="passenger-stat-box">
                    <Text className="passenger-stat-label">乗車</Text>
                    <Text className="passenger-stat-value">{passenger.rides}</Text>
                  </div>

                  {/* Cột hiển thị trạng thái (ステータス) */}
                  <div className="passenger-stat-box">
                    <Text className="passenger-stat-label">ステータス</Text>
                    <div className="passenger-status-wrapper">
                      {/* Dấu chấm tròn biểu thị màu trạng thái */}
                      <span className={`passenger-status-dot passenger-dot-${passenger.status}`} />
                      <Text className={`passenger-status-text passenger-status-${passenger.status}`}>
                        {passenger.statusText}
                      </Text>
                    </div>
                  </div>

                </div>
              </Card>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}></div>
          )}
        </div>
      </div>

      {/* Thanh BottomNavBar điều hướng dưới chân trang */}
      <div className="admin-bottom-nav">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className={`admin-bottom-nav-button ${activeNavTab === 'overview' ? 'active' : ''}`}
          aria-label="概要"
        >
          <LayoutDashboard size={24} strokeWidth={activeNavTab === 'overview' ? 2.5 : 2} />
          <span>概要</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/driver-management')}
          className={`admin-bottom-nav-button ${activeNavTab === 'driver' ? 'active' : ''}`}
          aria-label="ドライバー"
        >
          <CarFront size={24} strokeWidth={activeNavTab === 'driver' ? 2.5 : 2} />
          <span>ドライバー</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNavTab('user')}
          className={`admin-bottom-nav-button ${activeNavTab === 'user' ? 'active' : ''}`}
          aria-label="顧客"
        >
          <Users size={24} strokeWidth={activeNavTab === 'user' ? 2.5 : 2} />
          <span>顧客</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/driver-approval-list')}
          className={`admin-bottom-nav-button ${activeNavTab === 'approval' ? 'active' : ''}`}
          aria-label="承認"
        >
          <ShieldCheck size={24} strokeWidth={activeNavTab === 'approval' ? 2.5 : 2} />
          <span>承認</span>
        </button>
      </div>
    </div>
  );
};

export default PassengerManagement;