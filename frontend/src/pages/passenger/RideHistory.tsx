import React from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import { TripCard } from '../../components/RideHistory/TripCard';
import type { TripData } from '../../types/RideHistory';
import IconCalendar from '../../assets/IconCalendar.svg';
import './Profile.css';

const mockTrips: TripData[] = [
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
  }
];

export default function RideHistory() {
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
        <div className="w-full flex flex-col gap-[16px] pb-[40px]">
          {mockTrips.map((trip) => (
            <TripCard key={trip.id} {...trip} />
          ))}
        </div>
      </div>

      <BottomNavBar activeTab="history" />
    </div>
  );
}
