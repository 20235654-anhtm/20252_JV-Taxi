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
import WaitingDriver from '../pages/passenger/WaitingDriver';

// Driver Pages
import DriverDashboard from '../pages/driver/DriverDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<GuestHome />} />
      <Route path="/guest/search-location" element={<GuestSearchLocation />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUpSelection />} />
      <Route path="/signup/passenger" element={<PassengerSignUp />} />
      <Route path="/signup/driver" element={<DriverSignUp />} />

      {/* PASSENGER FLOW */}
      <Route path="/passenger" element={<PassengerHome />} />
      <Route path="/passenger/search-location" element={<SearchLocation />} />
      <Route path="/passenger/booking-options" element={<BookingOptions />} />
      <Route path="/passenger/select-driver" element={<SelectDriver />} />
      <Route path="/passenger/driver-detail" element={<DriverDetail />} />
      <Route path="/passenger/waiting-driver" element={<WaitingDriver />} />

      {/* DRIVER FLOW */}
      <Route path="/driver" element={<DriverDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
