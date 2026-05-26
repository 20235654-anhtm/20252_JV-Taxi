import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import { TripCard } from '../../components/RideHistory/TripCard';
import type { TripData } from '../../types/RideHistory';
import IconCalendar from '../../assets/IconCalendar.svg';
import './Profile.css';

const ALL_MOCK_TRIPS: TripData[] = [
  {
    id: "trip-1",
    driverName: "Nguyen Van Anh",
    driverAvatar: "https://avatar.iran.liara.run/public/boy?username=nguyenvananh",
    price: "₫145,000",
    status: "完了",
    startLocationName: "ホテル ニッコー サイゴン",
    startLocationAddress: "1区 グエンヴァンクー通り 235番地",
    endLocationName: "タンソンニャット国際空港 第2ターミナル",
    endLocationAddress: "タンビン区 チュオンソン通り",
    date: "2023年10月12日",
    time: "午前08:45",
  },
  {
    id: "trip-2",
    driverName: "Tran Thi Bich",
    driverAvatar: "https://avatar.iran.liara.run/public/girl?username=tranthibich",
    price: "₫210,000",
    status: "完了",
    startLocationName: "ビンコムセンター ランドマーク81",
    startLocationAddress: "ビンタイン区",
    endLocationName: "クレセント モール",
    endLocationAddress: "7区 フーミーフン",
    date: "2023年10月8日",
    time: "午後01:15",
  },
  {
    id: "trip-3",
    driverName: "Sato Takeshi",
    driverAvatar: "https://avatar.iran.liara.run/public/boy?username=satotakeshi",
    price: "₫120,000",
    status: "完了",
    startLocationName: "ベンタイン市場",
    startLocationAddress: "1区",
    endLocationName: "ホアセン大学",
    endLocationAddress: "1区 グエンヴァンチャン通り",
    date: "2023年10月5日",
    time: "午前10:30",
  },
  {
    id: "trip-4",
    driverName: "Le Van Cuong",
    driverAvatar: "https://avatar.iran.liara.run/public/boy?username=levancuong",
    price: "₫90,000",
    status: "完了",
    startLocationName: "サイゴン中央郵便局",
    startLocationAddress: "1区",
    endLocationName: "サイゴン動植物園",
    endLocationAddress: "1区",
    date: "2023年10月2日",
    time: "午後03:20",
  },
  {
    id: "trip-5",
    driverName: "Pham Thi Dung",
    driverAvatar: "https://avatar.iran.liara.run/public/girl?username=phamthidung",
    price: "₫350,000",
    status: "完了",
    startLocationName: "イオンモール タンフー",
    startLocationAddress: "タンフー区",
    endLocationName: "スイティエン公園",
    endLocationAddress: "9区",
    date: "2023年9月28日",
    time: "午前09:15",
  },
  {
    id: "trip-6",
    driverName: "Hoang Van E",
    driverAvatar: "https://avatar.iran.liara.run/public/boy?username=hoangvane",
    price: "₫85,000",
    status: "完了",
    startLocationName: "チョロン (Binh Tay Market)",
    startLocationAddress: "6区",
    endLocationName: "ダムセン公園",
    endLocationAddress: "11区",
    date: "2023年9月25日",
    time: "午後05:45",
  },
  {
    id: "trip-7",
    driverName: "Ngo Thi F",
    driverAvatar: "https://avatar.iran.liara.run/public/girl?username=ngothif",
    price: "₫110,000",
    status: "完了",
    startLocationName: "ホーチミン美術館",
    startLocationAddress: "1区",
    endLocationName: "独立宮殿",
    endLocationAddress: "1区",
    date: "2023年9月20日",
    time: "午前11:00",
  }
];

const ITEMS_PER_PAGE = 3;

export default function RideHistory() {
  // State quản lý dữ liệu và phân trang
  const [trips, setTrips] = useState<TripData[]>(ALL_MOCK_TRIPS.slice(0, ITEMS_PER_PAGE));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(ALL_MOCK_TRIPS.length > ITEMS_PER_PAGE);

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

  // Giả lập gọi API Backend mỗi khi biến `page` thay đổi
  useEffect(() => {
    if (page === 1) return; // Bỏ qua trang 1 vì đã lấy khi khởi tạo state

    setLoading(true);
    
    // Giả lập mạng chậm 1.5 giây
    setTimeout(() => {
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const newTrips = ALL_MOCK_TRIPS.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      // Gộp mảng dữ liệu cũ với mảng mới tải về
      setTrips(prev => [...prev, ...newTrips]);
      setLoading(false);

      // Nếu đã lấy hết mảng mock
      if (startIndex + ITEMS_PER_PAGE >= ALL_MOCK_TRIPS.length) {
        setHasMore(false);
      }
    }, 1500);
  }, [page]);

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
            <div className="text-[#171D17] text-[12px] font-[700] leading-[16px] break-words flex flex-col justify-center">2023年10月</div>
          </div>
        </div>

        {/* Trip Cards List */}
        <div className="w-full flex flex-col gap-[16px]">
          {trips.map((trip, index) => {
            if (trips.length === index + 1) {
              return (
                <div ref={lastTripElementRef} key={trip.id}>
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
        {!hasMore && (
          <div className="w-full text-center py-4 text-[#3D4A3F] text-[14px] font-bold">
            これ以上の履歴はありません
          </div>
        )}
      </div>

      <BottomNavBar activeTab="history" />
    </div>
  );
}
