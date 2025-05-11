import { useState, useEffect } from 'react';
import { User, UserRole, UserApi } from '../../api/UserApi';
import ProfileSettings from './ProfileSettings/ProfileSettings';
import { formatImageUrl, createInitialPlaceholder } from '../../utils/imageUtils';
import './Profile.scss';

interface ProfileProps {
  user: User | null;
  onUserUpdate?: (updatedUser: User) => void;
}

const Profile = ({ user, onUserUpdate }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user);

  useEffect(() => {
    const refreshUserData = async () => {
      if (user && user.id) {
        try {
          const freshUserData = await UserApi.getCurrentUser();
          if (freshUserData) {
            setCurrentUser(freshUserData);
            if (onUserUpdate) {
              onUserUpdate(freshUserData);
            }
          }
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        }
      } else {
        setCurrentUser(user);
      }
    };
    
    refreshUserData();
  }, [user, onUserUpdate]);

  if (!currentUser) {
    return <div className='profile-error'>Please login to view your profile</div>;
  }

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  if (isEditing) {
    return <ProfileSettings 
      initialUser={currentUser} 
      onUserUpdate={handleUserUpdate} 
      onBack={() => setIsEditing(false)}
    />;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-cover"></div>
        
        <div className="profile-picture">
          {currentUser.profilePicture ? (
            <img 
              src={formatImageUrl(currentUser.profilePicture)}
              alt={currentUser.name} 
              onError={(e) => {
                console.error("Failed to load profile image:", currentUser.profilePicture);
                (e.target as HTMLImageElement).src = createInitialPlaceholder(currentUser.name.charAt(0));
              }}
            />
          ) : (
            <div className="profile-picture-placeholder">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="profile-header">
          <h2>{currentUser.name}</h2>
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-meta">
            {currentUser.title && (
              <div className="meta-item">
                {currentUser.title}
              </div>
            )}
            {currentUser.location && (
              <div className="meta-item">
                {currentUser.location}
              </div>
            )}
            <div className="meta-item">
              {currentUser.role}
              {currentUser.role === UserRole.ADMIN && (
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
                  {currentUser.email}
                </span>
              </div>

              {currentUser.phoneNumber && (
                <div className="info-group">
                  <label>Phone</label>
                  <span className="link-item">
                    {currentUser.phoneNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {currentUser.bio && (
            <div className="profile-section">
              <h3 className="section-title">About</h3>
              <div className="profile-info">
                <div className="info-group full-width">
                  <p className="bio">{currentUser.bio}</p>
                </div>
              </div>
            </div>
          )}

          {currentUser.workExperience && currentUser.workExperience.length > 0 && (
            <div className="profile-section">
              <h3 className="section-title">
                Work Experience
              </h3>
              <div className="profile-info">
                {currentUser.workExperience.map((exp, index) => (
                  <div key={index} className="info-group full-width experience-item">
                    <h4 className="position">{exp.position}</h4>
                    <p className="company">{exp.company}</p>
                    <p className="dates">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { 
                        month: 'long',
                        year: 'numeric'
                      })} - {' '}
                      {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      }) : ''}
                    </p>
                    <p className="description">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentUser.socialLinks && currentUser.socialLinks.length > 0 && (
            <div className="profile-section">
              <h3 className="section-title">Social Profiles</h3>
              <div className="profile-info">
                <div className="info-group full-width">
                  <div className="social-links">
                    {currentUser.socialLinks.map((link, index) => {
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