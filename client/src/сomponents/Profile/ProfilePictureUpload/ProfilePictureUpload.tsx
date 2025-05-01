import { useState, useRef, useEffect } from 'react';
import "./ProfilePictureUpload.scss";
import { User, UserApi } from "../../../api/UserApi";
import { formatImageUrl } from '../../../utils/imageUtils';
import { toast } from "react-toastify";
import defaultAvatar from '../../../assets/default-avatar.svg';

interface ProfilePictureUploadProps {
  currentPicture?: string | null;
  onUpdate: (user: User) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ currentPicture, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentPicture) {
      const formattedUrl = formatImageUrl(currentPicture);
      setPreviewUrl(formattedUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [currentPicture]);

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
      setPreviewUrl(currentPicture ? formatImageUrl(currentPicture) : null);
      
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
      <div 
        className="profile-picture-wrapper"
        style={{
          backgroundImage: `url(${previewUrl || formatImageUrl(currentPicture, defaultAvatar)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
      </div>
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Upload New Picture
          </>
        )}
      </button>
    </div>
  );
};

export default ProfilePictureUpload;