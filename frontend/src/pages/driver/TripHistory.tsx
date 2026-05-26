import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import SummaryCard from '../../components/TripHistory/SummaryCard';
import FilterSection from '../../components/TripHistory/FilterSection';
import TripCard from '../../components/TripHistory/TripCard';
import type { Trip, Summary, FilterType } from '../../types/TripHistory';
import { getCache, setCache, CACHE_KEYS } from '../../services/cacheService';

// MOCK DATA
const mockSummary: Summary = {
  totalRevenue: 1240000,
  weeklyGrowth: 12,
  completedTrips: 42
};

const mockTrips: Trip[] = [
  { id: '1', date: '2026年5月27日', time: '14:20', pickupLocation: 'サンワ・タワー (1区)', destination: 'タンソンニャット国際空港', price: 145000, status: '支払済' },
  { id: '2', date: '2026年5月27日', time: '11:05', pickupLocation: 'クレセント・モール (7区)', destination: 'レタントン通り (1区)', price: 82000, status: '支払済' },
  { id: '3', date: '2026年5月26日', time: '21:45', pickupLocation: 'ランドマーク81 (ビンタン区)', destination: 'ビンホームズ・グランドパーク (9区)', price: 310000, status: '支払済' },
  { id: '4', date: '2026年5月26日', time: '09:10', pickupLocation: 'ベンタイン市場 (1区)', destination: 'サイゴン大教会 (1区)', price: 45000, status: '支払済' },
  { id: '5', date: '2026年5月25日', time: '15:30', pickupLocation: 'ビテクスコ・フィナンシャルタワー (1区)', destination: 'チョロン (5区)', price: 120000, status: '支払済' },
  { id: '6', date: '2026年5月25日', time: '18:00', pickupLocation: 'グエンフエ通り (1区)', destination: 'タオディエン (2区)', price: 155000, status: '支払済' },
];

const TripHistory = () => {
  const navigate = useNavigate();
  const [driverData, setDriverData] = useState<any>(() => getCache(CACHE_KEYS.DRIVER_PROFILE) || null);
  
  // Khởi tạo state từ cache nếu có
  const cachedState = React.useMemo(() => getCache<any>(CACHE_KEYS.TRIP_HISTORY_STATE), []);
  const [filter, setFilter] = useState<FilterType>(cachedState?.filter || 'today');
  const [page, setPage] = useState<number>(cachedState?.page || 1);
  const itemsPerPage = 3;
  
  const parseDate = (dateStr: string) => {
    const match = dateStr.match(/(\d+)年(\d+)月(\d+)日/);
    if (!match) return new Date(0);
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const day = today.getDay();
    // Monday as start of week
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date >= startOfWeek && date <= endOfWeek;
  };

  const filteredTrips = React.useMemo(() => {
    return mockTrips.filter(trip => {
      const date = parseDate(trip.date);
      if (filter === 'today') return isToday(date);
      if (filter === 'week') return isThisWeek(date);
      return true;
    });
  }, [filter]);

  const displayedTrips = React.useMemo(() => {
    return filteredTrips.slice(0, page * itemsPerPage);
  }, [filteredTrips, page]);

  const [loading, setLoading] = useState(false);
  const hasMore = displayedTrips.length < filteredTrips.length;
  const observer = useRef<IntersectionObserver | null>(null);

  // Khi đổi filter, reset page về 1 (chỉ reset nếu do user click đổi, không reset lúc mới mount nếu đang có cache)
  useEffect(() => {
    if (cachedState && cachedState.filter === filter && cachedState.page === page) {
      return; // Không reset nếu đang ở trạng thái khôi phục từ cache
    }
    setPage(1);
  }, [filter]);

  // Phục hồi scroll position
  useEffect(() => {
    if (cachedState && cachedState.scrollY > 0) {
      // Đợi DOM render xong thẻ thì cuộn tới vị trí cũ
      requestAnimationFrame(() => {
        window.scrollTo(0, cachedState.scrollY);
      });
    }
  }, [cachedState]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    setLoading(true);
    
    // Giả lập thời gian gọi API (delay 1s) để thấy hiệu ứng tải thêm thẻ
    setTimeout(() => {
      setPage(p => p + 1);
      setLoading(false);
    }, 1000);
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

        <SummaryCard summary={mockSummary} />
        <FilterSection activeFilter={filter} onFilterChange={setFilter} />

        <div className="flex flex-col gap-4">
          {displayedTrips.map((trip, index) => {
            if (displayedTrips.length === index + 1) {
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

        {!hasMore && (
          <div className="w-full text-center py-4 text-[#3D4A3F] text-[14px] font-bold">
            これ以上の履歴はありません
          </div>
        )}

        {loading && hasMore && (
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
