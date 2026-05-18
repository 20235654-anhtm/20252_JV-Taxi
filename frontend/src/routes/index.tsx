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

// Driver Pages
import DriverHome from '../pages/driver/DriverHome';

import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';
import WaitingDriver from '../pages/passenger/WaitingDriver';
import Rateyourtrip from '../pages/passenger/Rateyourtrip';
import ChatwithDriver from '../pages/passenger/ChatwithDriver';
import CallDriver from '../pages/passenger/CallDriver';
import InTrip from '../pages/passenger/InTrip';

// Driver Pages
import DriverDashboard from '../pages/driver/DriverDashboard';
import CallPassenger from '../pages/driver/CallPassenger';
import ChatwithPassenger from '../pages/driver/ChatwithPassenger';

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
      <Route path="/passenger/rate-trip" element={<PrivateRoute><Rateyourtrip /></PrivateRoute>} />
      <Route path="/passenger/chat" element={<PrivateRoute><ChatwithDriver /></PrivateRoute>} />

      {/* ======================= DRIVER FLOW (AUTHENTICATED) ======================= */}
      <Route path="/driver" element={<PrivateRoute><DriverHome /></PrivateRoute>} />
      <Route path="/driver/dashboard" element={<PrivateRoute><DriverDashboard /></PrivateRoute>} />
      <Route path="/driver/chat" element={<PrivateRoute><ChatwithPassenger /></PrivateRoute>} />
      <Route path="/driver/call-passenger" element={<PrivateRoute><CallPassenger /></PrivateRoute>} />
      <Route path="/driver/in-trip" element={<PrivateRoute><InTrip /></PrivateRoute>} />
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
      <Route path="/passenger/call-driver" element={<CallDriver />} />
      <Route path="/passenger/in-trip" element={<InTrip />} />
      <Route path="/passenger/rate-trip" element={<Rateyourtrip />} />

      {/* DRIVER FLOW */}
      <Route path="/driver" element={<DriverDashboard />} />
      <Route path="/driver/chat" element={<ChatwithPassenger />} />
      <Route path="/driver/call-passenger" element={<CallPassenger />} />
      <Route path="/driver/in-trip" element={<InTrip />} />
    </Routes>
  );
};

export default AppRoutes;
