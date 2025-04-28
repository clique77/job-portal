import { useState, useRef } from 'react';
import "./ProfilePictureUpload.scss";
import { User, UserApi } from "../../../api/UserApi";
import { toast } from "react-toastify";
import defaultAvatar from '../../../assets/default-avatar.svg';

interface ProfilePictureUploadProps {
  currentPicture?: string | null;
  onUpdate: (user: User) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ currentPicture, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const updatedUser = await UserApi.updateProfilePicture(file);
      onUpdate(updatedUser);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      setPreviewUrl(currentPicture || null);
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile picture. Please try again.');
      }
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="profile-picture-container">
      <img
        src={previewUrl || 
          (currentPicture ? 
            (currentPicture.startsWith('http') 
              ? currentPicture 
              : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${currentPicture}`
            ) 
            : defaultAvatar
          )
        }
        alt="Profile"
        className="profile-picture"
        onError={(e) => {
          console.error("Error loading image:", (e.target as HTMLImageElement).src);
          (e.target as HTMLImageElement).src = defaultAvatar;
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button 
        className="upload-button" 
        onClick={handleUploadClick}
        disabled={loading}
        type="button"
      >
        {loading ? (
          <>
            <div className="loading-spinner" />
            Uploading...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload New Picture
          </>
        )}
      </button>
    </div>
  );
};

export default ProfilePictureUpload;