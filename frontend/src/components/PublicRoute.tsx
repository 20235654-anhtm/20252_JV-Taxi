import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    const user = JSON.parse(userStr);
    // Nếu là Passenger đã đăng nhập, chuyển hướng về trang dashboard của họ
    if (user.role === 'CUSTOMER') {
      return <Navigate to="/passenger" replace />;
    }
    if (user.role === 'DRIVER') {
      return <Navigate to="/driver" replace />;
    }
  }

  return <>{children}</>;
};

export default PublicRoute;
