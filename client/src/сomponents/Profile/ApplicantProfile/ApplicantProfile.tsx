import { useState, useEffect } from 'react';
import { User, UserApi } from '../../../api/UserApi';
import { formatImageUrl, createInitialPlaceholder } from '../../../utils/imageUtils';
import './ApplicantProfile.scss';

interface ApplicantProfileProps {
  userId: string;
  onClose: () => void;
}

const ApplicantProfile = ({ userId, onClose }: ApplicantProfileProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await UserApi.getUserById(userId);
        setUser(userData);
      } catch (err) {
        const errorMessage = (err as Error).message || 'Failed to load user profile';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return (
    <div className="applicant-profile-modal">
      <div className="applicant-profile-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        
        {loading && (
          <div className="profile-loading">
            <div className="loading-spinner"></div>
            <div>Loading profile...</div>
          </div>
        )}
        
        {error && !loading && (
          <div className="profile-error">
            <div>Error: {error}</div>
            <button className="retry-button" onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}
        
        {!loading && !error && user && (
          <div className="profile-container">
            <div className="profile-card">
              <div className="profile-cover"></div>
              
              <div className="applicant-profile-picture">
                {user.profilePicture ? (
                  <img 
                    src={formatImageUrl(user.profilePicture)}
                    alt={user.name} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createInitialPlaceholder(user.name.charAt(0));
                    }}
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="applicant-profile-header">
                <h2>{user.name}</h2>
                {user.title && <div className="profile-title">{user.title}</div>}
              </div>

              <div className="profile-content">
                <div className="applicant-profile-meta">
                  {user.location && (
                    <div className="meta-item">
                      {user.location}
                    </div>
                  )}
                  <div className="meta-item">
                    {user.role}
                  </div>
                </div>

                <div className="profile-section">
                  <h3 className="section-title">Contact Information</h3>
                  <div className="profile-info">
                    <div className="info-group">
                      <label>Email</label>
                      <span className="link-item">{user.email}</span>
                    </div>

                    {user.phoneNumber && (
                      <div className="info-group">
                        <label>Phone</label>
                        <span className="link-item">{user.phoneNumber}</span>
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

                {user.workExperience && user.workExperience.length > 0 && (
                  <div className="profile-section">
                    <h3 className="section-title">Work Experience</h3>
                    <div className="profile-info">
                      {user.workExperience.map((exp, index) => (
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
        )}
      </div>
    </div>
  );
};

export default ApplicantProfile; 