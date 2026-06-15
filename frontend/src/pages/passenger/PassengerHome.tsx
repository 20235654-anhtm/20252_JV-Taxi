import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../../components/features/MapView';
import { Header } from '../../components/layout/Header';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import type { NavTab } from '../../components/layout/BottomNavBar';
import { getCache, CACHE_KEYS } from '../../services/cacheService';
import { FAB } from '../../components/ui/FAB';
import { useGeolocation } from '../../hooks/useGeolocation';
import { QuickBookingCard } from '../../components/features/QuickBookingCard';
import { useBooking } from '../../contexts/BookingContext';
import { API_BASE_URL } from '../../config/api';

const PassengerHome = () => {
  const navigate = useNavigate();
  const { position, error, permissionDenied } = useGeolocation();
  const { destination, setDestination, setPickup } = useBooking();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentLang, setCurrentLang] = useState<'jp' | 'vn'>('jp');
  const [recenterKey, setRecenterKey] = useState(0);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  let parsedUser = null;
  try {
    const userStr = sessionStorage.getItem('user');
    parsedUser = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
  } catch (e) {}
  const user = getCache<any>(CACHE_KEYS.USER_PROFILE) || parsedUser;
  
  const [destinationInput, setDestinationInput] = useState(destination?.address || '');

  // Fetch active ride on page mount
  useEffect(() => {
    const fetchActiveRide = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/rides/active/current`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data) {
            setActiveRide(res.data);
            
            // Persist ride details in sessionStorage so other screens can retrieve them
            sessionStorage.setItem('active_ride_id', res.data.id);
            if (res.data.driver) {
              const driverObj = {
                id: res.data.driver.id,
                name: res.data.driver.fullName || '...',
                avatar: res.data.driver.driverProfile?.avatarPicture || '',
                rating: res.data.driver.driverProfile?.averageRating ? String(res.data.driver.driverProfile.averageRating) : '4.9',
                car: (() => {
                  const info = res.data.driver.driverProfile?.vehicleInfor;
                  if (!info) return '...';
                  try {
                    return JSON.parse(info).model || '...';
                  } catch (e) {
                    return info;
                  }
                })(),
                licensePlate: (() => {
                  const info = res.data.driver.driverProfile?.vehicleInfor;
                  if (!info) return '...';
                  try {
                    return JSON.parse(info).plate || '...';
                  } catch (e) {
                    return '...';
                  }
                })()
              };
              sessionStorage.setItem('active_driver', JSON.stringify(driverObj));
            }
            sessionStorage.setItem('active_pickup_location', res.data.start_address || res.data.startAddress);
            sessionStorage.setItem('active_destination_location', res.data.end_address || res.data.endAddress);
            sessionStorage.setItem('active_start_lat', String(res.data.startLat));
            sessionStorage.setItem('active_start_lng', String(res.data.startLng));
            sessionStorage.setItem('active_end_lat', String(res.data.endLat));
            sessionStorage.setItem('active_end_lng', String(res.data.endLng));
            sessionStorage.setItem('active_fare', `${Math.round(Number(res.data.match_fee || res.data.matchFee) / 1000)}k VND`);
            
            // Auto-populate booking context coordinates
            setPickup({
              address: res.data.start_address || res.data.startAddress,
              coords: { lat: Number(res.data.startLat), lng: Number(res.data.startLng) }
            });
            setDestination({
              address: res.data.end_address || res.data.endAddress,
              coords: { lat: Number(res.data.endLat), lng: Number(res.data.endLng) }
            });
          } else {
            setActiveRide(null);
          }
        }
      } catch (err) {
        console.error('Error fetching active ride:', err);
      }
    };

    fetchActiveRide();
  }, [setPickup, setDestination]);

  const handleBookNow = () => {
    if (destinationInput.trim()) {
      setDestination({ address: destinationInput, coords: null });
      navigate('/passenger/search-location', { state: { initialSearch: destinationInput } });
    } else {
      navigate('/passenger/search-location');
    }
  };

  const userAvatar = user?.avatar || user?.driverProfile?.avatarPicture || null;

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      navigate('/passenger/profile');
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <Header
        variant="passenger"
        userAvatar={userAvatar}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* Bản đồ - luôn hiển thị, popup phủ lên nếu GPS bị từ chối */}
      <div style={styles.mapWrapper}>
        <MapView
          position={position}
          error={error}
          permissionDenied={permissionDenied}
          zoom={15}
          recenterKey={recenterKey}
          hasBottomNav
          showPickupLabel
          viewPadding={{ top: 64, bottom: activeRide ? 440 : 380 }}
        />
      </div>

      {/* Chỉ hiển thị khi có quyền GPS */}
      {!permissionDenied && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-[450px] gradient-sheet pointer-events-none z-[1000]" />

          {activeRide ? (
            /* ACTIVE RIDE POPUP */
            <div style={sheetStyles.container}>
              {/* Drag handle */}
              <div 
                style={sheetStyles.dragHandle} 
                onClick={() => setIsExpanded(!isExpanded)}
              />
              
              {/* Header */}
              <div 
                style={sheetStyles.header}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span style={sheetStyles.title}>進行中の乗車</span>
                {!isExpanded && (
                  <span style={sheetStyles.expandHint}>タップして詳細を表示</span>
                )}
              </div>

              {isExpanded && (
                <div style={sheetStyles.expandedContent}>
                  {/* Pickup Row */}
                  <div style={sheetStyles.locationRow}>
                    <div style={sheetStyles.iconContainerGreen}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006D37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div style={sheetStyles.locationInfo}>
                      <div style={sheetStyles.locationLabel}>乗車場所</div>
                      <div style={sheetStyles.locationValue}>{activeRide.start_address || activeRide.startAddress}</div>
                    </div>
                  </div>

                  {/* Destination Row */}
                  <div style={sheetStyles.locationRow}>
                    <div style={sheetStyles.iconContainerRed}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                    </div>
                    <div style={sheetStyles.locationInfo}>
                      <div style={sheetStyles.locationLabel}>目的地</div>
                      <div style={sheetStyles.locationValue}>{activeRide.end_address || activeRide.endAddress}</div>
                    </div>
                  </div>

                  {/* Driver Profile Block */}
                  {activeRide.driver && (
                    <div style={sheetStyles.profileCard}>
                      <div style={sheetStyles.avatarWrapper}>
                        {activeRide.driver.avatar || activeRide.driver.driverProfile?.avatarPicture ? (
                          <img 
                            src={activeRide.driver.avatar || activeRide.driver.driverProfile?.avatarPicture} 
                            alt="Driver avatar" 
                            style={sheetStyles.avatarImg}
                          />
                        ) : (
                          <div style={sheetStyles.avatarPlaceholder}>
                            {activeRide.driver.fullName ? activeRide.driver.fullName.charAt(0).toUpperCase() : 'D'}
                          </div>
                        )}
                      </div>
                      
                      <div style={sheetStyles.profileInfo}>
                        <div style={sheetStyles.nameRow}>
                          <span style={sheetStyles.profileName}>{activeRide.driver.fullName}</span>
                          {(() => {
                            const info = activeRide.driver.driverProfile?.vehicleInfor;
                            let plate = '';
                            if (info) {
                              try {
                                plate = JSON.parse(info).plate || '';
                              } catch (e) {
                                plate = info.split(' • ')[1] || '';
                              }
                            }
                            return plate && (
                              <span style={sheetStyles.plateTag}>{plate}</span>
                            );
                          })()}
                        </div>
                        
                        <div style={sheetStyles.carDetails}>
                          {(() => {
                            const info = activeRide.driver.driverProfile?.vehicleInfor;
                            if (!info) return '...';
                            try {
                              const parsed = JSON.parse(info);
                              return `${parsed.model || ''} • ${parsed.color || ''}`;
                            } catch (e) {
                              return info;
                            }
                          })()}
                        </div>
                        
                        <div style={sheetStyles.rating}>
                          <span style={{ color: '#FEA520', marginRight: '4px' }}>★</span>
                          <span>{activeRide.driver.driverProfile?.averageRating ? Number(activeRide.driver.driverProfile.averageRating).toFixed(1) : '4.9'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show Map Button */}
              <button 
                onClick={() => {
                  if (activeRide.status === 'PENDING') {
                    navigate('/passenger/waiting-driver', { state: { rideId: activeRide.id } });
                  } else if (activeRide.status === 'ACCEPTED') {
                    if (sessionStorage.getItem('driver_arrived') === 'true') {
                      navigate('/passenger/in-trip', { state: { rideId: activeRide.id, driver: JSON.parse(sessionStorage.getItem('active_driver') || '{}') } });
                    } else {
                      navigate('/passenger/waiting-driver-pickup', { state: { rideId: activeRide.id, driver: JSON.parse(sessionStorage.getItem('active_driver') || '{}') } });
                    }
                  }
                }}
                style={sheetStyles.button}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
                <span>地図を表示</span>
              </button>
            </div>
          ) : (
            <QuickBookingCard
              userName={user?.fullName || '...'}
              destinationValue={destinationInput}
              setDestinationValue={setDestinationInput}
              onBookNow={handleBookNow}
            />
          )}

          <FAB
            onClick={() => setRecenterKey(k => k + 1)}
            ariaLabel="現在地に戻る"
            style={{ bottom: activeRide ? '230px' : '200px', zIndex: 1010 }}
          />
        </>
      )}

      {/* BottomNavBar luôn hiển thị */}
      <BottomNavBar
        activeTab="home"
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    position: 'relative',
    width: '100vw',
    height: '100vh', // Fallback for older browsers
    minHeight: '100dvh',
    overflow: 'hidden',
  },
  mapWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
};

const sheetStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: '96px',
    left: '16px',
    right: '16px',
    background: '#ffffff',
    borderRadius: '32px 32px 24px 24px',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.12)',
    padding: '24px',
    zIndex: 1011,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Plus Jakarta Sans", "Noto Sans JP", sans-serif',
    boxSizing: 'border-box',
    border: '1px solid rgba(0, 109, 55, 0.08)',
  },
  dragHandle: {
    width: '40px',
    height: '5px',
    background: '#E5E9E5',
    borderRadius: '9999px',
    margin: '0 auto 16px auto',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#006D37',
  },
  expandHint: {
    fontSize: '12px',
    color: '#71717A',
    fontWeight: '600',
  },
  expandedContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '16px',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconContainerGreen: {
    width: '40px',
    height: '40px',
    background: '#EFF6EC',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconContainerRed: {
    width: '40px',
    height: '40px',
    background: '#FDF2F2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locationInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    flex: 1,
  },
  locationLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#71717A',
    marginBottom: '2px',
  },
  locationValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#171D17',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileCard: {
    background: '#EFF6EC',
    borderRadius: '16px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px',
  },
  avatarWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    background: '#006D37',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '2px',
  },
  profileName: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#171D17',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  plateTag: {
    background: '#ffffff',
    border: '1px solid #E4EBE0',
    borderRadius: '6px',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#3D4A3F',
  },
  carDetails: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#3D4A3F',
    marginBottom: '2px',
  },
  rating: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#3D4A3F',
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    background: '#006D37',
    color: '#ffffff',
    border: 'none',
    borderRadius: '24px',
    padding: '14px 0',
    fontSize: '16px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0px 8px 24px rgba(0, 109, 55, 0.22)',
    transition: 'background 0.2s ease',
  }
};

export default PassengerHome;
