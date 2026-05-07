import { Routes, Route } from 'react-router-dom';

// Import các trang của Guest
import GuestHome from '../pages/guest/GuestHome';
import GuestSearchLocation from '../pages/guest/GuestSearchLocation';
import SignIn from '../pages/guest/SignIn';
import SignUpSelection from '../pages/guest/SignUpSelection';
import PassengerSignUp from '../pages/guest/PassengerSignUp';
import DriverSignUp from '../pages/guest/DriverSignUp';

// Import các trang của Passenger
import PassengerHome from '../pages/passenger/PassengerHome';
import SearchLocation from '../pages/passenger/SearchLocation';
import BookingOptions from '../pages/passenger/BookingOptions';
import SelectDriver from '../pages/passenger/SelectDriver';
import DriverDetail from '../pages/passenger/DriverDetail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================= LUỒNG CHO KHÁCH (CHƯA ĐĂNG NHẬP) ======================= */}
      {/* Trang chủ dành cho khách */}
      <Route path="/" element={<GuestHome />} />
      
      {/* Trang tìm, chọn điểm đến cho khách */}
      <Route path="/guest/search-location" element={<GuestSearchLocation />} />
      
      {/* Màn hình đăng nhập */}
      <Route path="/login" element={<SignIn />} />
      
      {/* Màn hình chọn vai trò (khi chọn đăng ký) */}
      <Route path="/signup" element={<SignUpSelection />} />
      
      {/* Màn hình đăng ký hành khách */}
      <Route path="/signup/passenger" element={<PassengerSignUp />} />
      
      {/* Màn hình đăng ký tài xế */}
      <Route path="/signup/driver" element={<DriverSignUp />} />


      {/* ======================= LUỒNG CHO HÀNH KHÁCH (ĐÃ ĐĂNG NHẬP) ======================= */}
      {/* Trang chủ cho hành khách */}
      <Route path="/passenger" element={<PassengerHome />} />
      
      {/* Trang tìm, chọn điểm đến */}
      <Route path="/passenger/search-location" element={<SearchLocation />} />
      
      {/* Trang chọn phương thức ghép cuốc */}
      <Route path="/passenger/booking-options" element={<BookingOptions />} />
      
      {/* Trang danh sách tài xế */}
      <Route path="/passenger/select-driver" element={<SelectDriver />} />
      
      {/* Trang chi tiết tài xế */}
      <Route path="/passenger/driver-detail" element={<DriverDetail />} />
    </Routes>
  );
};

export default AppRoutes;
