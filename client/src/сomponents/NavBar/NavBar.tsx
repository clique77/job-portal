import { Link } from "react-router-dom";
import './NavBar.scss';

const NavBar = () => {
  return (
    <header className="main-header">
      <div className="navbar-wrapper">
        <div className="navbar-brand">
          <Link to="/">Job Portal</Link>
        </div>
        <div className="navbar-menu">
          <Link to="/registration">Register</Link>
        </div>
      </div>
    </header>
  )
}

export default NavBar;
