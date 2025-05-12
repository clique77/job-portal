import { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../../api/UserApi';

interface RoleBasedRouteProps {
  user: User | null;
  isLoading: boolean;
  children: JSX.Element;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RoleBasedRoute = ({ 
  user, 
  isLoading,
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: RoleBasedRouteProps) => {
  // First, check if authentication is still being verified
  if (isLoading) {
    return <div className="loading-auth">Verifying authentication...</div>;
  }
  
  // Only redirect if definitely not authenticated (after loading completes)
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to='/' replace />;
  }

  return children;
};

export default RoleBasedRoute; 