import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import SummaryCard from '../../components/TripHistory/SummaryCard';
import FilterSection from '../../components/TripHistory/FilterSection';
import TripCard from '../../components/TripHistory/TripCard';
import type { Trip, Summary, FilterType } from '../../types/TripHistory';
import { getCache, setCache, CACHE_KEYS } from '../../services/cacheService';
import { API_BASE_URL } from '../../config/api';
import { removeVietnameseTones } from '../../utils/stringUtils';

const TripHistory = () => {
  const navigate = useNavigate();
  const [driverData, setDriverData] = useState<any>(() => getCache(CACHE_KEYS.DRIVER_PROFILE) || null);
  
  // Khởi tạo state từ cache nếu có
  const cachedState = React.useMemo(() => getCache<any>(CACHE_KEYS.TRIP_HISTORY_STATE), []);
  const [filter, setFilter] = useState<FilterType>(cachedState?.filter || 'all');
  const [page, setPage] = useState<number>(cachedState?.page || 1);
  const itemsPerPage = 3;

  const [summary, setSummary] = useState<Summary>({
    totalRevenue: 0,
    weeklyGrowth: 0,
    completedTrips: 0
  });
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const isFirstMount = useRef(true);

  const fetchData = useCallback(async (pageNum: number, currentFilter: FilterType, customLimit?: number) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const limitVal = customLimit || itemsPerPage;
      const response = await fetch(
        `${API_BASE_URL}/api/rides/driver/history?page=${pageNum}&limit=${limitVal}&filter=${currentFilter}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch driver history');
      const resData = await response.json();
      
      if (resData.success) {
        setSummary(resData.summary);
        
        const mappedTrips = resData.data.map((ride: any) => {
          const dateObj = new Date(ride.createdAt);
          const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
          
          const hours = dateObj.getHours();
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          const timeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
          
          const getLocDetails = (addr: string) => {
            if (!addr) return '...';
            addr = removeVietnameseTones(addr);
            const parts = addr.split(',');
            return parts[0].trim();
          };

          const statusMap: Record<string, string> = {
            PENDING: '保留中',
            ACCEPTED: '受付済',
            REJECTED: '拒否',
            COMPLETED: '支払済',
            CANCELLED: 'キャンセル済',
          };

          return {
            id: ride.id,
            date: dateStr,
            time: timeStr,
            pickupLocation: getLocDetails(ride.startAddress),
            destination: getLocDetails(ride.endAddress),
            price: ride.payment?.totalAmount ? Number(ride.payment.totalAmount) : (ride.matchFee ? Number(ride.matchFee) : 0),
            status: statusMap[ride.status] || ride.status
          };
        });

        if (pageNum === 1) {
          setTrips(mappedTrips);
        } else {
          setTrips(prev => [...prev, ...mappedTrips]);
        }
        
        setHasMore(resData.pagination.hasMore);
      }
    } catch (err) {
      console.error('Error fetching driver history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        if (page > 1) {
          // Fetch gộp tất cả các trang từ 1 đến page hiện tại
          await fetchData(1, filter, page * itemsPerPage);
          if (cachedState?.scrollY > 0) {
            requestAnimationFrame(() => {
              window.scrollTo(0, cachedState.scrollY);
            });
          }
          return;
        }
      }
      
      fetchData(page, filter);
    };

    loadData();
  }, [page, filter, fetchData]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
  };

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    setPage(p => p + 1);
  }, [hasMore, loading]);

  const handleTripClick = (id: string) => {
    // Lưu trạng thái trước khi nhảy sang trang detail
    setCache(CACHE_KEYS.TRIP_HISTORY_STATE, {
      filter,
      page,
      scrollY: window.scrollY
    });
    navigate(`/driver/history/${id}`);
  };

  const lastTripElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return; // Nếu đang loading thì không tạo observer mới
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [hasMore, loadMore, loading]);

  return (
    <div className="bg-[#F4FBF1] min-h-screen pb-[120px] font-['Plus_Jakarta_Sans']">
      <Header
        variant="auth"
        userAvatar={driverData?.avatar || driverData?.driverProfile?.avatarPicture || null}
        userName={driverData?.fullName || "Driver"}
        onAvatarClick={() => navigate('/driver/profile')}
      />
      <div className="px-5 pt-[90px] flex flex-col gap-6">
        {/* Title */}
        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'baseline', gap: 8, display: 'inline-flex'}}>
            <div style={{height: 36, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 30, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', lineHeight: '36px', wordWrap: 'break-word'}}>乗車履歴</div>
          </div>
          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '24px', wordWrap: 'break-word'}}>完了した乗車と売上の確認</div>
          </div>
        </div>

        <SummaryCard summary={summary} />
        <FilterSection activeFilter={filter} onFilterChange={handleFilterChange} />

        <div className="flex flex-col gap-4">
          {trips.map((trip, index) => {
            if (trips.length === index + 1) {
              return (
                <div ref={lastTripElementRef} key={trip.id}>
                  <TripCard 
                    trip={trip} 
                    onClick={() => handleTripClick(trip.id)}
                  />
                </div>
              );
            } else {
              return (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  onClick={() => handleTripClick(trip.id)}
                />
              );
            }
          })}
        </div>

        {!loading && trips.length === 0 && (
          <div className="w-full text-center py-8 text-[#3D4A3F] text-[16px]">
            乗車履歴がありません。
          </div>
        )}

        {!hasMore && trips.length > 0 && (
          <div className="w-full text-center py-4 text-[#3D4A3F] text-[14px] font-bold">
            これ以上の履歴はありません
          </div>
        )}

        {loading && (
          <div className="w-full flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#006D37]"></div>
          </div>
        )}
      </div>

      <BottomNavBar activeTab="history" role="driver" />
    </div>
  );
};

export default TripHistory;
