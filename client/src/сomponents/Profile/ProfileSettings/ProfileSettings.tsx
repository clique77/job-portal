import { useState, useEffect } from "react";
import { User, UserApi } from "../../../api/UserApi";
import ProfilePictureUpload from "../ProfilePictureUpload/ProfilePictureUpload";
import ProfileForm from "../ProfileForm/ProfileForm";
import PasswordForm from "../PasswordForm/PasswordForm";
import WorkExperienceForm from "../WorkExperience/WorkExperienceForm";
import { toast } from "react-toastify";
import UserIcon from "../Icons/UserIcon";
import CameraIcon from "../Icons/CameraIcon";
import KeyIcon from "../Icons/KeyIcon";
import BriefcaseIcon from "../Icons/BriefcaseIcon";
import "./ProfileSettings.scss";
import LoadingSpinner from "../Icons/LoadingSpinner";

interface ProfileSettingsProps {
  initialUser?: User | null;
  onUserUpdate?: (updatedUser: User) => void;
  onBack?: () => void;
}

const ProfileSettings = ({ initialUser, onUserUpdate, onBack }: ProfileSettingsProps) => {
  const [loading, setLoading] = useState<boolean>(initialUser ? false : true);
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (!initialUser) {
      const fetchUser = async () => {
        try {
          const userData = await UserApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          toast.error('Failed to load user data');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [initialUser]);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="profile-settings">
      <div className="profile-settings__header">
        {onBack && (
          <button 
            className="back-button"
            onClick={onBack}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to Profile
          </button>
        )}
        <h1>Profile Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-settings__container">
        <div className="profile-settings__sidebar">
          <div className="profile-picture-section">
            <h2>
              <CameraIcon />
              Profile Picture
            </h2>
            <ProfilePictureUpload 
              currentPicture={user?.profilePicture}
              onUpdate={handleUserUpdate}
            />
          </div>
        </div>

        <div className="profile-settings__main">
          <div className="settings-section">
            <h2>
              <UserIcon />
              Profile Information
            </h2>
            <ProfileForm 
              initialData={user}
              onUpdate={handleUserUpdate}
            />
          </div>

          <div className="settings-section">
            <h2>
              <BriefcaseIcon />
              Work Experience
            </h2>
            {user && (
              <WorkExperienceForm 
                user={user}
                onUpdate={handleUserUpdate}
              />
            )}
          </div>

          <div className="settings-section">
            <h2>
              <KeyIcon />
              Security
            </h2>
            <button 
              className="change-password-btn"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="password-modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="password-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setIsPasswordModalOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="password-modal__header">
              <h2>Change Password</h2>
              <p>Enter your current password and choose a new one</p>
            </div>
            <PasswordForm onSuccess={() => setIsPasswordModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;