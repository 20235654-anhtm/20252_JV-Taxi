export interface TripSummaryDetailType {
  id: string;
  distance: number;
  duration: number; // in minutes
  status: string; // "完了"
  totalIncome: number;
  tip: number;
  rating: number;
  passenger: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  timeline: {
    pickup: {
      time: string;
      location: string;
    };
    dropoff: {
      time: string;
      location: string;
    };
  };
  bill: {
    distanceFee: number;
    bookingFee: number; // 指名料 (Nomination fee / Booking fee)
    total: number; // 手取り合計 (Net total)
  };
}

export interface MapSectionProps {
  distance: number;
  duration: number;
  status: string;
}

export interface TotalIncomeCardProps {
  totalIncome: number;
  tip: number;
  rating: number;
}

export interface PassengerInfoProps {
  passenger: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  timeline: {
    pickup: { time: string; location: string };
    dropoff: { time: string; location: string };
  };
  onClickMessage?: () => void;
}

export interface BillSectionProps {
  distance: number;
  distanceFee: number;
  bookingFee: number;
  total: number;
}

export interface ButtonActionProps {
  onClick: () => void;
}
