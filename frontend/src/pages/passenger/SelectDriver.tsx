import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { useBooking } from '../../contexts/BookingContext';
import { Avatar } from '../../components/ui/Avatar';
import './SelectDriver.css';

/** Interface for driver data from API */
interface Driver {
  id: string;
  name: string;
  car: string;
  vehicleType: string;
  distance: string;
  distanceMeters: number;
  time: string;
  price: string;
  rating: number;
  avatar: string;
  jlpt: string | null;
}

/** Search status types */
type SearchStatus = 'searching' | 'found' | 'timeout' | 'error' | 'no_gps';

/** Helper to format JSON vehicle info string to a readable string */
const formatVehicleInfo = (info: string) => {
  try {
    const parsed = JSON.parse(info);
    const model = parsed.model || '';
    const secondary = parsed.color || parsed.plate || '';
    if (model && secondary) return `${model} • ${secondary}`;
    return model || info;
  } catch (e) {
    return info;
  }
};

/** Search timeout (5 minutes = 300,000ms) */
// const SEARCH_TIMEOUT_MS = 5 * 60 * 1000;
const SEARCH_TIMEOUT_MS = 5 * 1000;


/** Polling interval (15 seconds) */
const POLLING_INTERVAL_MS = 15 * 1000;

import { API_BASE_URL } from '../../config/api';

const API_BASE = `${API_BASE_URL}/api/drivers`;

const SelectDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup, destination } = useBooking();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('searching');
  const [timeRemaining, setTimeRemaining] = useState(SEARCH_TIMEOUT_MS);
  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null);

  const [estimatedFare, setEstimatedFare] = useState<number | null>(() => {
    const fromState = location.state?.fare;
    if (fromState && fromState !== '...') {
      return Number(fromState);
    }
    const fromSession = sessionStorage.getItem('estimated_fare');
    if (fromSession) {
      return Number(fromSession) + 15000; // adding designated surcharge
    }
    return null;
  });

  // Refs for timers and state tracking
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchStartRef = useRef<number>(Date.now());
  const driversCountRef = useRef<number>(0);

  // Keep driversCountRef in sync
  useEffect(() => {
    driversCountRef.current = drivers.length;
  }, [drivers.length]);

  useEffect(() => {
    if (estimatedFare !== null) return;
    const pCoords = pickup?.coords;
    const dCoords = destination?.coords;
    if (!pCoords || !dCoords) return;

    const fetchFare = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/fare/estimate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startLng: pCoords.lng,
            startLat: pCoords.lat,
            endLng: dCoords.lng,
            endLat: dCoords.lat,
            vehicleType: 'CAR_4_SEATER',
          }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          const baseFare = data.data.fare.totalFare;
          setEstimatedFare(baseFare + 15000); // designated surcharge
          sessionStorage.setItem('estimated_fare', String(baseFare));
        }
      } catch (error) {
        console.error('Error fetching fare estimation in SelectDriver:', error);
      }
    };
    fetchFare();
  }, [estimatedFare, pickup?.coords, destination?.coords]);

  /** Task 18: Get accurate GPS location */
  const getGPSLocation = useCallback(() => {
    return new Promise<{ lng: number; lat: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  /** Fetch driver list based on coordinates */
  const fetchDrivers = useCallback(async (lng?: number, lat?: number) => {
    try {
      let url = `${API_BASE}/nearby`;
      
      console.log("[SelectDriver] fetchDrivers called with coords:", { lng, lat });
      
      if (lng !== undefined && lat !== undefined && !isNaN(lng) && !isNaN(lat)) {
        url += `?lng=${lng}&lat=${lat}&radius=3000`;
        console.log("[SelectDriver] Fetching nearby drivers from URL:", url);
      } else {
        // Fallback to all drivers if no coordinates provided
        url = API_BASE;
        console.log("[SelectDriver] Coords missing or invalid. Falling back to all drivers URL:", url);
      }

      const response = await fetch(url);
      const data = await response.json();
      
      console.log("[SelectDriver] API Response data:", data);

      if (data.success) {
        setDrivers(data.data);
        if (data.data.length > 0) {
          setSearchStatus('found');
        }
        return data.data.length > 0;
      }
      return false;
    } catch (error) {
      console.error('[SelectDriver] Backend connection error:', error);
      return false;
    }
  }, []);

  /** Start the search process */
  const startSearch = useCallback(async () => {
    console.log("[SelectDriver] startSearch triggered. Pickup data in context:", pickup);
    
    // Reset state
    setDrivers([]);
    setSearchStatus('searching');
    setTimeRemaining(SEARCH_TIMEOUT_MS);
    searchStartRef.current = Date.now();
    driversCountRef.current = 0;

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // START TIMERS IMMEDIATELY (Don't wait for GPS/API)
    
    // Task 20: Countdown timer
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - searchStartRef.current;
      const remaining = Math.max(0, SEARCH_TIMEOUT_MS - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0 && countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    }, 1000);

    // Task 20: Timeout after 5 mins if no drivers found
    timeoutRef.current = setTimeout(() => {
      setSearchStatus(prev => {
        if (driversCountRef.current === 0 && (prev === 'searching' || prev === 'found')) {
           return 'timeout';
        }
        return prev;
      });
      
      if (driversCountRef.current === 0) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
      }
    }, SEARCH_TIMEOUT_MS);

    // Parallel execution of GPS and initial fetch
    let currentLng: number | undefined;
    let currentLat: number | undefined;

    if (pickup?.coords) {
      currentLng = pickup.coords.lng;
      currentLat = pickup.coords.lat;
      setCoords({ lng: currentLng, lat: currentLat });
      console.log("[SelectDriver] Using selected pickup coordinates for driver search:", currentLng, currentLat);
    } else {
      console.log("[SelectDriver] pickup.coords not found in BookingContext, trying GPS...");
      try {
        // Attempt to get GPS
        const pos = await getGPSLocation();
        setCoords(pos);
        currentLng = pos.lng;
        currentLat = pos.lat;
        console.log("[SelectDriver] Successfully retrieved browser GPS:", pos);
      } catch (err) {
        console.warn("[SelectDriver] GPS failed, using default data:", err);
      }
    }

    // Initial API call
    await fetchDrivers(currentLng, currentLat);

    // Task 20: Set polling every 15s to find new drivers
    pollingRef.current = setInterval(async () => {
      await fetchDrivers(currentLng, currentLat);
    }, POLLING_INTERVAL_MS);

  }, [fetchDrivers, getGPSLocation, pickup]);

  /** Start search on mount */
  useEffect(() => {
    startSearch();

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [startSearch]);

  /** Format remaining time */
  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /** Handle driver selection */
  const handleSelectDriver = (driver: Driver) => {
    console.log('Driver selected:', driver.name);
    // Navigate to details
    navigate('/passenger/driver-review-detail', { state: { driver, fare: estimatedFare } });
  };

  return (
    <div className="select-driver-page">
      <Header
        variant="passenger"
        showBackButton={true}
        title="ドライバー選択"
        onBackClick={() => navigate(-1)}
        hideBrandName={true}
        hideLanguageToggle={true}
      />

      <div className="select-driver-content">
        {/* Status Row */}
        <div className="sd-status-row">
          <div className="sd-status-title">
            <span className="sd-status-dot" />
            <span>周辺のドライバー (3km圏内)</span>
          </div>
          <div className="sd-live-badge">ライブ更新</div>
        </div>

        {/* Timer Badge - hiện khi đang tìm */}
        {searchStatus === 'searching' && drivers.length === 0 && (
          <div className="sd-timer-badge">
            <span className="sd-timer-icon">⏱</span>
            <span>検索中... {formatTimeRemaining(timeRemaining)}</span>
          </div>
        )}

        {/* Loading State - khi chưa có dữ liệu */}
        {searchStatus === 'searching' && drivers.length === 0 && (
          <div className="sd-loading-state">
            <div className="sd-loading-spinner-large" />
            <p>ドライバーを検索中...</p>
          </div>
        )}

        {/* Task 20: Timeout State - Thông báo khi hết 5 phút không tìm thấy ai */}
        {searchStatus === 'timeout' && (
          <div className="sd-timeout-state">
            <div className="sd-timeout-icon">🚫</div>
            <h3 className="sd-timeout-title">
              現在、近くにドライバーがいません
            </h3>
            <p className="sd-timeout-message">
              しばらくしてから再度お試しください
            </p>
            <button
              className="sd-retry-btn"
              onClick={startSearch}
            >
              再検索する
            </button>
          </div>
        )}

        {/* Driver List - Task 19 */}
        {drivers.length > 0 && (
          <>
            <div className="sd-driver-list">
              {drivers.map((driver) => (
                <div className="sd-driver-card" key={driver.id}>
                  <div className="sd-card-top">
                    <div className="sd-driver-info">
                      <div className="sd-avatar-wrapper">
                        <Avatar 
                          src={driver.avatar} 
                          name={driver.name} 
                          className="sd-avatar-img" 
                          borderColor="none" 
                        />
                        <div className="sd-rating-badge">
                          <span className="sd-rating-star">★</span>
                          {driver.rating && !isNaN(Number(driver.rating)) ? Number(driver.rating).toFixed(1) : driver.rating}
                        </div>
                      </div>

                      <div className="sd-driver-details">
                        <h3 className="sd-driver-name">{driver.name}</h3>
                        <p className="sd-car-model">{formatVehicleInfo(driver.car)}</p>
                        <div className="sd-tags">
                          {driver.jlpt && driver.jlpt !== 'N/A' && driver.jlpt.trim() !== '' && (
                            <span className="sd-tag sd-tag--jlpt">{driver.jlpt}</span>
                          )}
                          <span className="sd-tag">{driver.distance}</span>
                          <span className="sd-tag">{driver.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="sd-price-info">
                      <p className="sd-price">
                        {estimatedFare !== null 
                          ? `₫${estimatedFare.toLocaleString()}` 
                          : (driver.price ? (driver.price.startsWith('₫') || driver.price.startsWith('đ') ? driver.price : `₫${driver.price}`) : '...')}
                      </p>
                      <p className="sd-price-label">合計予想金額</p>
                    </div>
                  </div>

                  <button
                    className="sd-select-btn"
                    onClick={() => handleSelectDriver(driver)}
                  >
                    選択する ﹥
                  </button>
                </div>
              ))}
            </div>

            {/* Loading Footer - tiếp tục tìm thêm tài xế */}
            {searchStatus !== 'timeout' && (
              <div className="sd-loading-footer">
                <div className="sd-spinner" />
                <p className="sd-loading-text">
                  ドライバーをさらに検索中...
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
    </div>
  );
};

export default SelectDriver;
