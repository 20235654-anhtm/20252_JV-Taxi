export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapCardProps {
  pickupPosition?: LatLng;
  destinationPosition?: LatLng;
}

export interface DriverInfoCardProps {
  driverName: string;
  driverAvatar: string;
  carModel: string; 
  driverNameKana: string; 
  onMessageClick?: () => void;
}

export interface RouteTimelineCardProps {
  startLocationName: string;
  startLocationAddress: string;
  endLocationName: string;
  endLocationAddress: string;
  startTime: string;
  endTime: string;
}

export interface TripStatsCardProps {
  duration: string;
  distance: string;
  paymentMethod: string;
}

export interface ReceiptCardProps {
  distanceFee: string;
  bookingFee: string;
  total: string;
  distanceLabel: string;
}

export interface ReviewCardProps {
  rating: number;
  comment: string;
}

export interface TripDetailData {
  carModel: string;
  driverNameKana: string;
  duration: string;
  distance: string;
  paymentMethod: string;
  distanceFee: string;
  bookingFee: string;
  total: string;
  rating: number;
  comment: string;
  reviewDate: string;
  endTime: string;
  pickupPosition?: LatLng;
  destinationPosition?: LatLng;
  driverAvatar: string;
}
