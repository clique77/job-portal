import { Link, useNavigate } from "react-router-dom";
import './NavBar.scss';
import { UserApi, User } from "../../api/UserApi";

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
              <Link to="/saved-jobs" className="saved-jobs-link">
                Saved Jobs
              </Link>
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
