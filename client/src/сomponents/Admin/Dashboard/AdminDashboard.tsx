import { useState } from 'react';
import './AdminDashboard.scss';
import UsersManagement from '../Users/UsersManagement';
import JobsManagement from '../Jobs/JobsManagement';
import CompaniesManagement from '../Companies/CompaniesManagement';
import ApplicationsManagement from '../Applications/ApplicationsManagement';
import { User } from '../../../api/UserApi';

interface AdminDashboardProps {
  user: User | null;
}

type AdminSection = 'dashboard' | 'users' | 'jobs' | 'companies' | 'applications';

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="admin-dashboard-stats">
            <h2>Admin Dashboard</h2>
            <div className="dashboard-cards">
              <div className="dashboard-card" onClick={() => setActiveSection('users')}>
                <h3>Users</h3>
                <div className="card-icon">👤</div>
                <p>Manage all users</p>
              </div>
              <div className="dashboard-card" onClick={() => setActiveSection('jobs')}>
                <h3>Jobs</h3>
                <div className="card-icon">💼</div>
                <p>Manage job listings</p>
              </div>
              <div className="dashboard-card" onClick={() => setActiveSection('companies')}>
                <h3>Companies</h3>
                <div className="card-icon">🏢</div>
                <p>Manage companies</p>
              </div>
              <div className="dashboard-card" onClick={() => setActiveSection('applications')}>
                <h3>Applications</h3>
                <div className="card-icon">📝</div>
                <p>View all applications</p>
              </div>
            </div>
          </div>
        );
      case 'users':
        return <UsersManagement />;
      case 'jobs':
        return <JobsManagement />;
      case 'companies':
        return <CompaniesManagement />;
      case 'applications':
        return <ApplicationsManagement />;
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin CMD</h2>
        </div>
        <nav className="admin-navigation">
          <ul>
            <li 
              className={activeSection === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveSection('dashboard')}
            >
              <span className="icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </li>
            <li 
              className={activeSection === 'users' ? 'active' : ''}
              onClick={() => setActiveSection('users')}
            >
              <span className="icon">👤</span>
              <span className="nav-text">Users</span>
            </li>
            <li 
              className={activeSection === 'jobs' ? 'active' : ''}
              onClick={() => setActiveSection('jobs')}
            >
              <span className="icon">💼</span>
              <span className="nav-text">Jobs</span>
            </li>
            <li 
              className={activeSection === 'companies' ? 'active' : ''}
              onClick={() => setActiveSection('companies')}
            >
              <span className="icon">🏢</span>
              <span className="nav-text">Companies</span>
            </li>
            <li 
              className={activeSection === 'applications' ? 'active' : ''}
              onClick={() => setActiveSection('applications')}
            >
              <span className="icon">📝</span>
              <span className="nav-text">Applications</span>
            </li>
          </ul>
        </nav>
        <div className="admin-user-info">
          <div className="user-avatar">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user?.name} />
            ) : (
              <span className="avatar-placeholder">👤</span>
            )}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'Admin'}</p>
            <p className="user-role">Administrator</p>
          </div>
        </div>
      </div>
      <div className="admin-main-content">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 