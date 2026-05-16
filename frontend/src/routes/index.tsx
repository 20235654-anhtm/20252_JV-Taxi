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
import RideInProgress from '../pages/passenger/RideInProgress';
import ChatScreen from '../pages/passenger/ChatScreen';

// Driver Pages
import DriverHome from '../pages/driver/DriverHome';
import DriverDashboard from '../pages/driver/DriverDashboard';
import DriverRideInProgress from '../pages/driver/DriverRideInProgress';
import DriverChatScreen from '../pages/driver/DriverChatScreen';

import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================= GUEST FLOW ======================= */}
      <Route path="/" element={<PublicRoute><GuestHome /></PublicRoute>} />
      <Route path="/guest/search-location" element={<PublicRoute><GuestSearchLocation /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUpSelection /></PublicRoute>} />
      <Route path="/signup/passenger" element={<PublicRoute><PassengerSignUp /></PublicRoute>} />
      <Route path="/signup/driver" element={<PublicRoute><DriverSignUp /></PublicRoute>} />

      {/* ======================= PASSENGER FLOW ======================= */}
      <Route path="/passenger" element={<PrivateRoute><PassengerHome /></PrivateRoute>} />
      <Route path="/passenger/search-location" element={<PrivateRoute><SearchLocation /></PrivateRoute>} />
      <Route path="/passenger/booking-options" element={<PrivateRoute><BookingOptions /></PrivateRoute>} />
      <Route path="/passenger/select-driver" element={<PrivateRoute><SelectDriver /></PrivateRoute>} />
      <Route path="/passenger/driver-detail" element={<PrivateRoute><DriverDetail /></PrivateRoute>} />
      <Route path="/passenger/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/passenger/waiting-driver" element={<PrivateRoute><WaitingDriver /></PrivateRoute>} />
      <Route path="/passenger/ride-in-progress" element={<PrivateRoute><RideInProgress /></PrivateRoute>} />
      <Route path="/passenger/chat" element={<PrivateRoute><ChatScreen /></PrivateRoute>} />

      {/* ======================= DRIVER FLOW ======================= */}
      <Route path="/driver" element={<PrivateRoute><DriverDashboard /></PrivateRoute>} />
      <Route path="/driver/home" element={<PrivateRoute><DriverHome /></PrivateRoute>} />
      <Route path="/driver/ride-in-progress" element={<PrivateRoute><DriverRideInProgress /></PrivateRoute>} />
      <Route path="/driver/chat" element={<PrivateRoute><DriverChatScreen /></PrivateRoute>} />
    </Routes>
  );
};

export default AppRoutes;
