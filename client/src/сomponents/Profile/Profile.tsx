import { useState } from 'react';
import { User, UserRole } from '../../api/UserApi';
import ProfileSettings from './ProfileSettings/ProfileSettings';
import { formatImageUrl, createInitialPlaceholder } from '../../utils/imageUtils';
import './Profile.scss';

interface ProfileProps {
  user: User | null;
  onUserUpdate?: (updatedUser: User) => void;
}

const Profile = ({ user, onUserUpdate }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <div className='profile-error'>Please login to view your profile</div>;
  }

  const handleUserUpdate = (updatedUser: User) => {
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  if (isEditing) {
    return <ProfileSettings 
      initialUser={user} 
      onUserUpdate={handleUserUpdate} 
      onBack={() => setIsEditing(false)}
    />;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-cover"></div>
        
        <div className="profile-picture">
          {user.profilePicture ? (
            <img 
              src={formatImageUrl(user.profilePicture)}
              alt={user.name} 
              onError={(e) => {
                console.error("Failed to load profile image:", user.profilePicture);
                (e.target as HTMLImageElement).src = createInitialPlaceholder(user.name.charAt(0));
              }}
            />
          ) : (
            <div className="profile-picture-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="profile-header">
          <h2>{user.name}</h2>
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-meta">
            {user.title && (
              <div className="meta-item">
                {user.title}
              </div>
            )}
            {user.location && (
              <div className="meta-item">
                {user.location}
              </div>
            )}
            <div className="meta-item">
              {user.role}
              {user.role === UserRole.ADMIN && (
                <span className="profile-badge">Administrator</span>
              )}
            </div>
          </div>

          <div className="profile-section">
            <h3 className="section-title">Contact Information</h3>
            <div className="profile-info">
              <div className="info-group">
                <label>Email</label>
                <span className="link-item">
                  {user.email}
                </span>
              </div>

              {user.phoneNumber && (
                <div className="info-group">
                  <label>Phone</label>
                  <span className="link-item">
                    {user.phoneNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <div className="profile-section">
              <h3 className="section-title">About</h3>
              <div className="profile-info">
                <div className="info-group full-width">
                  <p className="bio">{user.bio}</p>
                </div>
              </div>
            </div>
          )}

          {user.socialLinks && user.socialLinks.length > 0 && (
            <div className="profile-section">
              <h3 className="section-title">Social Profiles</h3>
              <div className="profile-info">
                <div className="info-group full-width">
                  <div className="social-links">
                    {user.socialLinks.map((link, index) => {
                      let displayName;
                      try {
                        const hostname = new URL(link).hostname.toLowerCase();
                        displayName = hostname.replace('www.', '');
                        
                        if (hostname.includes('linkedin')) {
                          displayName = 'LinkedIn';
                        } else if (hostname.includes('github')) {
                          displayName = 'GitHub';
                        } else if (hostname.includes('twitter') || hostname.includes('x.com')) {
                          displayName = 'Twitter';
                        }
                      } catch (e) {
                        displayName = link;
                      }
                      
                      return (
                        <a 
                          key={index} 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {displayName}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;