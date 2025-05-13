import { Link, useNavigate } from "react-router-dom";
import './NavBar.scss';
import { UserApi, User, UserRole } from "../../api/UserApi";

export interface NavBarProps {
  user: User | null;
  isLoading: boolean;
  onLogout: () => void;
}

const NavBar = ({ user, isLoading, onLogout }: NavBarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await UserApi.logout();
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed: ', error);
    }
  };

  const renderUserLinks = () => {
    if (!user) return null;

    if (user.role === UserRole.EMPLOYER) {
      return (
        <>
          <Link to="/companies" className="nav-link">
            My Companies
          </Link>
        </>
      );
    } else if (user.role === UserRole.JOB_SEEKER) {
      return (
        <>
          <Link to="/saved-jobs" className="nav-link">
            Saved Jobs
          </Link>
          <Link to="/my-applications" className="nav-link applications-link">
            My Applications
          </Link>
        </>
      );
    } else if (user.role === UserRole.ADMIN) {
      return (
        <>
          <Link to="/admin" className="nav-link admin-link">
            Admin Dashboard
          </Link>
        </>
      );
    }
    
    return null;
  };

  return (
    <header className="main-header">
      <div className="navbar-wrapper">
        <div className="navbar-brand">
          <Link to="/">Job Portal</Link>
        </div>
        <div className="navbar-menu">
          {isLoading ? (
            <span className="loading-text">Loading...</span>
          ) : user ? (
            <>
              {renderUserLinks()}
              <Link to='/profile' className="user-name">
                <span>Welcome, {user.name}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/registration">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
