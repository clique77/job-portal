import { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../../api/UserApi';

interface RoleBasedRouteProps {
  user: User | null;
  children: JSX.Element;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RoleBasedRoute = ({ 
  user, 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: RoleBasedRouteProps) => {
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to='/' replace />;
  }

  return children;
};

export default RoleBasedRoute; 