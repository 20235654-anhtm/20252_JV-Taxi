import { Routes, Route } from 'react-router-dom';

// Guest Pages
import GuestHome from '../pages/guest/GuestHome';
import GuestSearchLocation from '../pages/guest/GuestSearchLocation';
import SignIn from '../pages/guest/SignIn';
import SignUpSelection from '../pages/guest/SignUpSelection';
import PassengerSignUp from '../pages/guest/PassengerSignUp';
import DriverSignUp from '../pages/guest/DriverSignUp';

// Passenger Pages
import PassengerHome from '../pages/passenger/PassengerHome';
import SearchLocation from '../pages/passenger/SearchLocation';
import BookingOptions from '../pages/passenger/BookingOptions';
import SelectDriver from '../pages/passenger/SelectDriver';
import DriverDetail from '../pages/passenger/DriverDetail';

import PrivateRoute from '../components/PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================= GUEST FLOW (UNAUTHENTICATED) ======================= */}
      {/* Guest home page */}
      <Route path="/" element={<GuestHome />} />
      
      {/* Search/select destination for guests */}
      <Route path="/guest/search-location" element={<GuestSearchLocation />} />
      
      {/* Sign-in screen */}
      <Route path="/login" element={<SignIn />} />
      
      {/* Role selection screen (for registration) */}
      <Route path="/signup" element={<SignUpSelection />} />
      
      {/* Passenger registration screen */}
      <Route path="/signup/passenger" element={<PassengerSignUp />} />
      
      {/* Driver registration screen */}
      <Route path="/signup/driver" element={<DriverSignUp />} />


      {/* ======================= PASSENGER FLOW (AUTHENTICATED) ======================= */}
      {/* Passenger dashboard */}
      <Route path="/passenger" element={<PrivateRoute><PassengerHome /></PrivateRoute>} />
      
      {/* Search/select destination */}
      <Route path="/passenger/search-location" element={<PrivateRoute><SearchLocation /></PrivateRoute>} />
      
      {/* Select booking options */}
      <Route path="/passenger/booking-options" element={<PrivateRoute><BookingOptions /></PrivateRoute>} />
      
      {/* Driver selection screen */}
      <Route path="/passenger/select-driver" element={<PrivateRoute><SelectDriver /></PrivateRoute>} />
      
      {/* Driver details screen */}
      <Route path="/passenger/driver-detail" element={<PrivateRoute><DriverDetail /></PrivateRoute>} />
    </Routes>
  );
};

export default AppRoutes;
