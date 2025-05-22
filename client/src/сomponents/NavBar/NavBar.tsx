import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './NavBar.scss';
import { UserApi, User, UserRole } from "../../api/UserApi";

export interface NavBarProps {
  user: User | null;
  isLoading: boolean;
  onLogout: () => void;
}

const NavBar = ({ user, isLoading, onLogout }: NavBarProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await UserApi.logout();
      onLogout();
      navigate('/login');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout failed: ', error);
    }
  };

  const renderUserLinks = () => {
    if (!user) return null;

    if (user.role === UserRole.EMPLOYER) {
      return (
        <>
          <Link to="/companies" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            My Companies
          </Link>
        </>
      );
    } else if (user.role === UserRole.JOB_SEEKER) {
      return (
        <>
          <Link to="/saved-jobs" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Saved Jobs
          </Link>
          <Link to="/my-applications" className="nav-link applications-link" onClick={() => setIsMenuOpen(false)}>
            My Applications
          </Link>
        </>
      );
    } else if (user.role === UserRole.ADMIN) {
      return (
        <>
          <Link to="/admin" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
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
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Job Portal</Link>
        </div>
        
        <button
          className="hamburger-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect y="6" width="28" height="2.5" rx="1.25" fill="#1a237e"/>
            <rect y="13" width="28" height="2.5" rx="1.25" fill="#1a237e"/>
            <rect y="20" width="28" height="2.5" rx="1.25" fill="#1a237e"/>
          </svg>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          {isLoading ? (
            <span className="loading-text">Loading...</span>
          ) : user ? (
            <>
              {renderUserLinks()}
              <Link to='/profile' className="user-name" onClick={() => setIsMenuOpen(false)}>
                <span>Welcome, {user.name}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/registration" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
