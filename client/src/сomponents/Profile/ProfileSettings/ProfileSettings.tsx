import { useState, useEffect } from "react";
import { User, UserApi } from "../../../api/UserApi";
import ProfilePictureUpload from "../ProfilePictureUpload/ProfilePictureUpload";
import ProfileForm from "../ProfileForm/ProfileForm";
import PasswordForm from "../PasswordForm/PasswordForm";
import { toast } from "react-toastify";
import UserIcon from "../Icons/UserIcon";
import CameraIcon from "../Icons/CameraIcon";
import KeyIcon from "../Icons/KeyIcon";
import "./ProfileSettings.scss";

const LoadingSpinner = () => (
  <div className="loading">
    <div className="loading-spinner"></div>
    <span>Loading...</span>
  </div>
);

const ProfileSettings = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
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
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="profile-settings">
      <div className="profile-settings__header">
        <h1>Profile Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-settings__container">
        <section className="profile-settings__section">
          <h2>
            <CameraIcon />
            Profile Picture
          </h2>
          <ProfilePictureUpload 
            currentPicture={user?.profilePicture}
            onUpdate={(updatedUser: User) => setUser(updatedUser)}
          />
        </section>

        <section className="profile-settings__section">
          <h2>
            <UserIcon />
            Profile Information
          </h2>
          <ProfileForm 
            initialData={user}
            onUpdate={(updatedUser: User) => setUser(updatedUser)}
          />
        </section>

        <section className="profile-settings__section">
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
        </section>
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