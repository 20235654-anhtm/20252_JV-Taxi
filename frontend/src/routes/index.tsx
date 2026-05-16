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
import Profile from '../pages/passenger/Profile';
import WaitingDriver from '../pages/passenger/WaitingDriver';
import Rateyourtrip from '../pages/passenger/Rateyourtrip';
import ChatwithDriver from '../pages/passenger/ChatwithDriver';
import CallDriver from '../pages/passenger/CallDriver';
import InTrip from '../pages/passenger/InTrip';

// Driver Pages
import DriverDashboard from '../pages/driver/DriverDashboard';
import DriverProfile from '../pages/driver/DriverProfile';

import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';

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
      <Route path="/passenger/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/passenger/chat" element={<PrivateRoute><ChatwithDriver /></PrivateRoute>} />
      <Route path="/passenger/waiting-driver" element={<PrivateRoute><WaitingDriver /></PrivateRoute>} />
      <Route path="/passenger/call-driver" element={<PrivateRoute><CallDriver /></PrivateRoute>} />
      <Route path="/passenger/in-trip" element={<PrivateRoute><InTrip /></PrivateRoute>} />
      <Route path="/passenger/rate-trip" element={<PrivateRoute><Rateyourtrip /></PrivateRoute>} />

      {/* ======================= DRIVER FLOW (AUTHENTICATED) ======================= */}
      <Route path="/driver" element={<PrivateRoute><DriverDashboard /></PrivateRoute>} />
      <Route path="/driver/profile" element={<PrivateRoute><DriverProfile /></PrivateRoute>} />
    </Routes>
  );
};

export default AppRoutes;
