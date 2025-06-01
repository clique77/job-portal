import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import './NavBar.scss';
import { UserApi, User, UserRole } from "../../api/UserApi";

export interface NavBarProps {
  user: User | null;
  isLoading: boolean;
  onLogout: () => void;
}

const LogoSVG = ({ type }: { type: 'default' | 'employer' | 'jobseeker' }) => {
  if (type === 'employer') {
    // Briefcase icon for employer
    return (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
        <circle cx="19" cy="19" r="19" fill="#1976d2" />
        <rect x="10" y="16" width="18" height="10" rx="3" fill="#fff" stroke="#1976d2" strokeWidth="2" />
        <rect x="15" y="13" width="8" height="5" rx="2" fill="#90caf9" stroke="#1976d2" strokeWidth="1.5" />
      </svg>
    );
  }
  if (type === 'jobseeker') {
    // User icon for job seeker
    return (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
        <circle cx="19" cy="19" r="19" fill="#1976d2" />
        <circle cx="19" cy="16" r="6" fill="#fff" stroke="#1976d2" strokeWidth="2" />
        <rect x="11" y="24" width="16" height="7" rx="3.5" fill="#90caf9" stroke="#1976d2" strokeWidth="1.5" />
      </svg>
    );
  }
  // Default blue J logo, center the J
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
      <circle cx="19" cy="19" r="19" fill="#1976d2" />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="22" fontWeight="bold" fontFamily="Arial, sans-serif">J</text>
    </svg>
  );
};

// SVGs for login/register
const LoginSVG = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '7px', verticalAlign: 'middle'}}><rect x="5" y="11" width="14" height="8" rx="2" fill="#90caf9"/><rect x="9" y="7" width="6" height="4" rx="2" fill="#1976d2"/><rect x="7" y="11" width="10" height="8" rx="1.5" fill="#fff" stroke="#1976d2" strokeWidth="1.5"/><path d="M12 15v2" stroke="#1976d2" strokeWidth="1.5" strokeLinecap="round"/></svg>
);
const RegisterSVG = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '7px', verticalAlign: 'middle'}}><circle cx="12" cy="8" r="4" fill="#90caf9"/><rect x="6" y="14" width="12" height="6" rx="3" fill="#1976d2"/><path d="M18 19v-2m0 0v-2m0 2h2m-2 0h-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
);

const NavBar = ({ user, isLoading, onLogout }: NavBarProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [_isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout failed: ', error);
    }
  };

  let logoType: 'default' | 'employer' | 'jobseeker' = 'default';
  let portalLabel = 'Job Portal';
  if (user) {
    if (user.role === UserRole.EMPLOYER) {
      logoType = 'employer';
      portalLabel = 'Employer Portal';
    } else if (user.role === UserRole.JOB_SEEKER) {
      logoType = 'jobseeker';
      portalLabel = 'Job Seeker Portal';
    }
  }

  const renderUserLinks = () => {
    if (!user) return null;

    if (user.role === UserRole.EMPLOYER) {
      return (
        <>
          <Link to="/companies" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '7px', verticalAlign: 'middle'}}><rect x="3" y="7" width="18" height="13" rx="2" fill="#90caf9"/><rect x="7" y="3" width="10" height="4" rx="1.5" fill="#1976d2"/><rect x="5" y="9" width="14" height="9" rx="1" fill="#fff" stroke="#1976d2" strokeWidth="1.5"/></svg>
            My Companies
          </Link>
        </>
      );
    } else if (user.role === UserRole.JOB_SEEKER) {
      return (
        <>
          <Link to="/saved-jobs" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '7px', verticalAlign: 'middle'}}><path d="M6 4a2 2 0 0 0-2 2v14l8-5 8 5V6a2 2 0 0 0-2-2H6z" fill="#f59e0b"/><path d="M4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-8-5-8 5z" stroke="#f59e0b" strokeWidth="1.5"/></svg>
            Saved Jobs
          </Link>
          <Link to="/my-applications" className="nav-link applications-link" onClick={() => setIsMenuOpen(false)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '7px', verticalAlign: 'middle'}}><rect x="3" y="4" width="18" height="16" rx="2" fill="#b2dfdb"/><rect x="7" y="2" width="10" height="4" rx="1.5" fill="#00897b"/><rect x="5" y="7" width="14" height="10" rx="1" fill="#fff" stroke="#00897b" strokeWidth="1.5"/><path d="M8 11h8M8 14h5" stroke="#00897b" strokeWidth="1.2" strokeLinecap="round"/></svg>
            My Applications
          </Link>
        </>
      );
    } else if (user.role === UserRole.ADMIN) {
      return (
        <>
          <Link to="/admin" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '7px', verticalAlign: 'middle'}}><circle cx="12" cy="12" r="10" fill="#ffd600"/><path d="M8 12h8M12 8v8" stroke="#ff6f00" strokeWidth="1.5"/></svg>
            Admin Dashboard
          </Link>
        </>
      );
    }
    
    return null;
  };

  return (
    <motion.header
      className="main-header"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="navbar-wrapper">
        <motion.div
          className="navbar-brand"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogoSVG type={logoType} />
            <span style={{ fontWeight: 700, fontSize: '1.5rem', color: '#1a237e' }}>{portalLabel}</span>
          </Link>
        </motion.div>
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
        <motion.div
          className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isLoading ? (
            <span className="loading-text">Loading...</span>
          ) : user ? (
            <>
              {renderUserLinks()}
              <Link to='/profile' className="user-name" onClick={() => setIsMenuOpen(false)}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '7px', verticalAlign: 'middle'}}><circle cx="12" cy="8" r="4" fill="#90caf9"/><rect x="6" y="14" width="12" height="6" rx="3" fill="#1976d2"/></svg>
                <span>Welcome, {user.name}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '7px', verticalAlign: 'middle'}}>
                  <circle cx="12" cy="12" r="10" fill="#fff" stroke="#e74c3c" strokeWidth="2"/>
                  <path d="M15.5 12H8.5" stroke="#e74c3c" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 8.5L15.5 12L12 15.5" stroke="#e74c3c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}><LoginSVG />Login</Link>
              <Link to="/registration" onClick={() => setIsMenuOpen(false)}><RegisterSVG />Register</Link>
            </>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
};

export default NavBar;
