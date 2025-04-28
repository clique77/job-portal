import { useState } from 'react';
import { User } from '../../api/UserApi';
import ProfileSettings from './ProfileSettings/ProfileSettings';
import './Profile.scss';

interface ProfileProps {
  user: User | null;
}

const Profile = ({ user }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <div className='profile-error'>Please login to view your profile</div>;
  }

  if (isEditing) {
    return <ProfileSettings />;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>My Profile</h2>
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="profile-picture">
          {user.profilePicture ? (
            <img 
              src={user.profilePicture.startsWith('http') 
                ? user.profilePicture 
                : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${user.profilePicture}`
              } 
              alt={user.name} 
              onError={(e) => {
                console.error("Failed to load profile image:", user.profilePicture);
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" font-size="50" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af">${user.name.charAt(0).toUpperCase()}</text></svg>`;
              }}
            />
          ) : (
            <div className="profile-picture-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
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

          {user.title && (
            <div className="info-group">
              <label>Title:</label>
              <span>{user.title}</span>
            </div>
          )}

          {user.bio && (
            <div className="info-group">
              <label>Bio:</label>
              <p className="bio">{user.bio}</p>
            </div>
          )}

          {user.location && (
            <div className="info-group">
              <label>Location:</label>
              <span>{user.location}</span>
            </div>
          )}

          {user.phoneNumber && (
            <div className="info-group">
              <label>Phone:</label>
              <span>{user.phoneNumber}</span>
            </div>
          )}

          {user.socialLinks && user.socialLinks.length > 0 && (
            <div className="info-group">
              <label>Social Links:</label>
              <div className="social-links">
                {user.socialLinks.map((link, index) => (
                  <a 
                    key={index} 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {new URL(link).hostname}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;