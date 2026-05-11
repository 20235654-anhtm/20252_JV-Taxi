import React, { createContext, useState, useContext, type ReactNode } from 'react';

// Cấu trúc dữ liệu cho một địa điểm
export interface LocationData {
  address: string;
  coords: { lat: number; lng: number } | null;
}

// Cấu trúc của toàn bộ State
interface BookingContextType {
  pickup: LocationData | null;
  setPickup: (loc: LocationData | null) => void;
  
  destination: LocationData | null;
  setDestination: (loc: LocationData | null) => void;
  
  hasAutoFilledPickup: boolean;
  setHasAutoFilledPickup: (val: boolean) => void;
}

// Khởi tạo Context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider Component để bọc bên ngoài ứng dụng
export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pickup, setPickup] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  
  // Cờ đánh dấu xem đã từng tự động điền GPS cho Điểm đón lần nào chưa
  const [hasAutoFilledPickup, setHasAutoFilledPickup] = useState<boolean>(false);

  return (
    <BookingContext.Provider
      value={{
        pickup,
        setPickup,
        destination,
        setDestination,
        hasAutoFilledPickup,
        setHasAutoFilledPickup,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook để sử dụng Context dễ dàng hơn
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
