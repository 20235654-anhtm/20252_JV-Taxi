import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import { TripCard } from '../../components/RideHistory/TripCard';
import type { TripData } from '../../types/RideHistory';
import IconCalendar from '../../assets/IconCalendar.svg';
import { API_BASE_URL } from '../../config/api';
import { removeVietnameseTones } from '../../utils/stringUtils';
import './Profile.css';

export const ALL_MOCK_TRIPS: TripData[] = [];

const ITEMS_PER_PAGE = 5;

export default function RideHistory() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Biến observer để theo dõi cuộn
  const observer = useRef<IntersectionObserver | null>(null);

  // Hàm này sẽ được "gắn" vào cái thẻ TripCard cuối cùng của danh sách
  const lastTripElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return; // Nếu đang tải rồi thì bỏ qua
    if (observer.current) observer.current.disconnect(); // Gỡ theo dõi cũ
    
    // Tạo bộ theo dõi mới
    observer.current = new IntersectionObserver(entries => {
      // Nếu người dùng cuộn đến thẻ cuối cùng VÀ vẫn còn dữ liệu để tải
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1); // Tăng page lên 1
      }
    });
    
    if (node) observer.current.observe(node); // Bắt đầu theo dõi thẻ cuối
  }, [loading, hasMore]);

  const fetchTrips = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/rides/passenger/history?page=${pageNum}&limit=${ITEMS_PER_PAGE}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      const resData = await response.json();
      if (resData.success) {
        const mappedTrips = resData.data.map((ride: any) => {
          const statusMap: Record<string, string> = {
            PENDING: '保留中',
            ACCEPTED: '受付済',
            REJECTED: '拒否',
            COMPLETED: '完了',
            CANCELLED: 'キャンセル済',
          };
          const getLocDetails = (addr: string) => {
            if (!addr) return { name: '...', address: '...' };
            addr = removeVietnameseTones(addr);
            const parts = addr.split(',');
            if (parts.length > 1) {
              return {
                name: parts[0].trim(),
                address: parts.slice(1).join(',').trim()
              };
            }
            return {
              name: addr,
              address: addr
            };
          };
          const startLoc = getLocDetails(ride.startAddress);
          const endLoc = getLocDetails(ride.endAddress);
          const dateObj = new Date(ride.createdAt);
          const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
          const hours = dateObj.getHours();
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? '午後' : '午前';
          const displayHours = hours % 12 || 12;
          const timeStr = `${ampm}${String(displayHours).padStart(2, '0')}:${minutes}`;

          return {
            id: ride.id,
            driverName: ride.driver?.fullName || '未定',
            driverAvatar: ride.driver?.driverProfile?.avatarPicture || ride.driver?.avatar || 'https://avatar.iran.liara.run/public/boy',
            price: ride.payment?.totalAmount ? `₫${Number(ride.payment.totalAmount).toLocaleString('vi-VN')}` : (ride.matchFee ? `₫${Number(ride.matchFee).toLocaleString('vi-VN')}` : '₫0'),
            status: statusMap[ride.status] || ride.status,
            startLocationName: startLoc.name,
            startLocationAddress: startLoc.address,
            endLocationName: endLoc.name,
            endLocationAddress: endLoc.address,
            date: dateStr,
            time: timeStr,
          };
        });

        setTrips(prev => pageNum === 1 ? mappedTrips : [...prev, ...mappedTrips]);
        setHasMore(resData.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips(page);
  }, [page, fetchTrips]);

  return (
    <div className="pp-container bg-[#f4fbf1] relative min-h-screen">
      <Header variant="passenger" />

      <div className="flex-1 overflow-y-auto px-[16px] pt-[95px] pb-[120px] w-full">
        {/* Title Section */}
        <div className="w-full px-[8px] flex justify-between items-center mb-[24px]">
          <div className="flex flex-col justify-start items-start">
            <div className="text-[#171D17] text-[24px] font-[800] leading-[32px] break-words flex flex-col justify-center">最近の乗車履歴</div>
            <div className="text-[#3D4A3F] text-[14px] font-[400] leading-[20px] break-words flex flex-col justify-center mt-1">以前の活動</div>
          </div>
          <div className="px-[16px] py-[8px] bg-[#E3EAE0] rounded-full flex justify-start items-center gap-[8px]">
            <img src={IconCalendar} alt="Calendar" className="w-[11px] h-[12px] text-[#006D37]" />
            <div className="text-[#171D17] text-[12px] font-[700] leading-[16px] break-words flex flex-col justify-center">履歴一覧</div>
          </div>
        </div>

        {/* Trip Cards List */}
        <div className="w-full flex flex-col gap-[16px]">
          {trips.map((trip, index) => {
            if (trips.length === index + 1) {
              return (
                <div ref={lastTripElementRef} key={trip.id} className="w-full">
                  <TripCard {...trip} />
                </div>
              );
            } else {
              return <TripCard key={trip.id} {...trip} />;
            }
          })}
        </div>

        {/* spin báo hiệu đang tải thêm data */}
        {loading && (
          <div className="w-full flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#006D37]"></div>
          </div>
        )}

        {/* Dòng chữ báo hết dữ liệu */}
        {!loading && !hasMore && trips.length > 0 && (
          <div className="w-full text-center py-4 text-[#3D4A3F] text-[14px] font-bold">
            これ以上の履歴はありません
          </div>
        )}

        {/* Dòng chữ báo không có dữ liệu nào */}
        {!loading && trips.length === 0 && (
          <div className="w-full text-center py-8 text-[#3D4A3F] text-[16px]">
            乗車履歴がありません。
          </div>
        )}
      </div>

      <BottomNavBar activeTab="history" />
    </div>
  );
}
