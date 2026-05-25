import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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
import WaitingDriver from '../pages/passenger/WaitingDriver';
import WatingDriverPickup from '../pages/passenger/WatingDriverPickup';
import BookingConfirmation from '../pages/passenger/BookingConfirmationWrapper';
import Rateyourtrip from '../pages/passenger/Rateyourtrip';
import ChatwithDriver from '../pages/passenger/ChatwithDriver';
import CallDriver from '../pages/passenger/CallDriver';
import InTrip from '../pages/passenger/InTrip';

// Driver Pages
import DriverDashboard from '../pages/driver/DriverDashboard';
import DriverProfile from '../pages/driver/DriverProfile';
import DriverProfileEdit from '../pages/driver/ProfileEdit';
import DriverCallTest from '../pages/driver/DriverCallTest';
import ChatwithPassenger from '../pages/driver/ChatwithPassenger';
import CallPassenger from '../pages/driver/CallPassenger';
import DriverInTrip from '../pages/driver/DriverInTrip';
import DriverApproval from '../pages/admin/DriverApproval';
import AdminDriverDetail from '../pages/admin/AdminDriverDetail';

// ── Auth Guards ──

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRole: 'CUSTOMER' | 'DRIVER';
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toUpperCase();

  if (userRole !== allowedRole) {
    if (userRole === 'DRIVER') {
      return <Navigate to="/driver" replace />;
    } else {
      return <Navigate to="/passenger" replace />;
    }
  }

  return children;
};

interface GuestRouteProps {
  children: React.ReactElement;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  const user = userStr ? JSON.parse(userStr) : null;

  if (token && user) {
    const userRole = user.role?.toUpperCase();
    if (userRole === 'DRIVER') {
      return <Navigate to="/driver" replace />;
    } else {
      return <Navigate to="/passenger" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================= GUEST FLOW (UNAUTHENTICATED) ======================= */}
      <Route path="/" element={<GuestRoute><GuestHome /></GuestRoute>} />
      <Route path="/guest/search-location" element={<GuestRoute><GuestSearchLocation /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><SignIn /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignUpSelection /></GuestRoute>} />
      <Route path="/signup/passenger" element={<GuestRoute><PassengerSignUp /></GuestRoute>} />
      <Route path="/signup/driver" element={<GuestRoute><DriverSignUp /></GuestRoute>} />

      {/* ======================= PASSENGER FLOW (AUTHENTICATED) ======================= */}
      <Route path="/passenger" element={<ProtectedRoute allowedRole="CUSTOMER"><PassengerHome /></ProtectedRoute>} />
      <Route path="/passenger/search-location" element={<ProtectedRoute allowedRole="CUSTOMER"><SearchLocation /></ProtectedRoute>} />
      <Route path="/passenger/booking-options" element={<ProtectedRoute allowedRole="CUSTOMER"><BookingOptions /></ProtectedRoute>} />
      <Route path="/passenger/select-driver" element={<ProtectedRoute allowedRole="CUSTOMER"><SelectDriver /></ProtectedRoute>} />
      <Route path="/passenger/driver-detail" element={<ProtectedRoute allowedRole="CUSTOMER"><DriverDetail /></ProtectedRoute>} />
      <Route path="/passenger/booking-confirmation" element={<ProtectedRoute allowedRole="CUSTOMER"><BookingConfirmation /></ProtectedRoute>} />
      <Route path="/passenger/profile" element={<ProtectedRoute allowedRole="CUSTOMER"><PassengerProfile /></ProtectedRoute>} />
      <Route path="/passenger/profile/edit" element={<ProtectedRoute allowedRole="CUSTOMER"><PassengerProfileEdit /></ProtectedRoute>} />
      <Route path="/passenger/add-card" element={<ProtectedRoute allowedRole="CUSTOMER"><AddCard /></ProtectedRoute>} />
      <Route path="/passenger/waiting-driver" element={<ProtectedRoute allowedRole="CUSTOMER"><WaitingDriver /></ProtectedRoute>} />
      <Route path="/passenger/waiting-driver-pickup" element={<ProtectedRoute allowedRole="CUSTOMER"><WatingDriverPickup /></ProtectedRoute>} />
      <Route path="/passenger/chat" element={<ProtectedRoute allowedRole="CUSTOMER"><ChatwithDriver /></ProtectedRoute>} />
      <Route path="/passenger/call-driver" element={<ProtectedRoute allowedRole="CUSTOMER"><CallDriver /></ProtectedRoute>} />
      <Route path="/passenger/in-trip" element={<ProtectedRoute allowedRole="CUSTOMER"><InTrip /></ProtectedRoute>} />
      <Route path="/passenger/rate-trip" element={<ProtectedRoute allowedRole="CUSTOMER"><Rateyourtrip /></ProtectedRoute>} />

      {/* ======================= DRIVER FLOW (AUTHENTICATED) ======================= */}
      <Route path="/driver" element={<ProtectedRoute allowedRole="DRIVER"><DriverDashboard /></ProtectedRoute>} />
      <Route path="/driver/profile" element={<ProtectedRoute allowedRole="DRIVER"><DriverProfile /></ProtectedRoute>} />
      <Route path="/driver/profile/edit" element={<ProtectedRoute allowedRole="DRIVER"><DriverProfileEdit /></ProtectedRoute>} />
      <Route path="/driver/call-test" element={<ProtectedRoute allowedRole="DRIVER"><DriverCallTest /></ProtectedRoute>} />
      <Route path="/driver/chat" element={<ProtectedRoute allowedRole="DRIVER"><ChatwithPassenger /></ProtectedRoute>} />
      <Route path="/driver/call-passenger" element={<ProtectedRoute allowedRole="DRIVER"><CallPassenger /></ProtectedRoute>} />
      <Route path="/driver/in-trip" element={<ProtectedRoute allowedRole="DRIVER"><DriverInTrip /></ProtectedRoute>} />

      {/* ======================= ADMIN FLOW ======================= */}
      <Route path="/admin" element={<DriverApproval />} />
      <Route path="/admin/driver-detail" element={<AdminDriverDetail />} />
    </Routes>
  );
};

export default AppRoutes;
