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
import PassengerProfile from '../pages/passenger/Profile';
import PassengerProfileEdit from '../pages/passenger/ProfileEdit';
import AddCard from '../pages/passenger/AddCard';

// Driver Pages
import DriverHome from '../pages/driver/DriverHome';
import DriverDashboard from '../pages/driver/DriverDashboard';
import DriverProfile from '../pages/driver/Profile';
import DriverProfileEdit from '../pages/driver/ProfileEdit';

import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';
import WaitingDriver from '../pages/passenger/WaitingDriver';
import BookingConfirmation from '../pages/passenger/BookingConfirmationWrapper';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================= GUEST FLOW (UNAUTHENTICATED) ======================= */}
      <Route path="/" element={<PublicRoute><GuestHome /></PublicRoute>} />
      <Route path="/guest/search-location" element={<PublicRoute><GuestSearchLocation /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUpSelection /></PublicRoute>} />
      <Route path="/signup/passenger" element={<PublicRoute><PassengerSignUp /></PublicRoute>} />
      <Route path="/signup/driver" element={<PublicRoute><DriverSignUp /></PublicRoute>} />

      {/* ======================= PASSENGER FLOW (AUTHENTICATED) ======================= */}
      <Route path="/passenger" element={<PrivateRoute><PassengerHome /></PrivateRoute>} />
      <Route path="/passenger/search-location" element={<PrivateRoute><SearchLocation /></PrivateRoute>} />
      <Route path="/passenger/booking-options" element={<PrivateRoute><BookingOptions /></PrivateRoute>} />
      <Route path="/passenger/select-driver" element={<PrivateRoute><SelectDriver /></PrivateRoute>} />
      <Route path="/passenger/driver-detail" element={<PrivateRoute><DriverDetail /></PrivateRoute>} />
      <Route path="/passenger/booking-confirmation" element={<PrivateRoute><BookingConfirmation /></PrivateRoute>} />
      <Route path="/passenger/profile" element={<PrivateRoute><PassengerProfile /></PrivateRoute>} />
      <Route path="/passenger/profile/edit" element={<PrivateRoute><PassengerProfileEdit /></PrivateRoute>} />
      <Route path="/passenger/add-card" element={<PrivateRoute><AddCard /></PrivateRoute>} />

      {/* ======================= DRIVER FLOW (AUTHENTICATED) ======================= */}
      <Route path="/driver" element={<PrivateRoute><DriverDashboard /></PrivateRoute>} />
      <Route path="/driver/profile" element={<PrivateRoute><DriverProfile /></PrivateRoute>} />
      <Route path="/driver/profile/edit" element={<PrivateRoute><DriverProfileEdit /></PrivateRoute>} />

      <Route path="/passenger/waiting-driver" element={<WaitingDriver />} />
    </Routes>
  );
};

export default AppRoutes;
