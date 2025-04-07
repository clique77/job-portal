import { User } from '../../api/UserApi';
import './Profile.scss';

interface ProfileProps {
  user: User | null;
}

const Profile = ({ user }: ProfileProps) => {
  if (!user) {
    return <div className='profile-error'>Please login to view your profile</div>;
  }

  return (
    <div className="profile-container">
    <div className="profile-card">
      <h2>My Profile</h2>
      
      <div className="profile-info">
        <div className="info-group">
          <label>Name:</label>
          <span>{user.name}</span>
        </div>

        <div className="info-group">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>

        <div className="info-group">
          <label>Role:</label>
          <span>{user.role}</span>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Profile;