import { useState, useEffect } from "react";
import { User, UserApi } from "../../../api/UserApi";
import "./ProfileForm.scss";
import { toast } from "react-toastify";

interface ProfileFormProps {
  initialData: User | null;
  onUpdate: (updatedUser: User) => void;
}

type ProfileFormData = {
  name: string;
  title: string;
  bio: string;
  location: string;
  phoneNumber: string;
  socialLinks: string[];
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onUpdate }) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    title: '',
    bio: '',
    location: '',
    phoneNumber: '',
    socialLinks: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        title: initialData.title || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        phoneNumber: initialData.phoneNumber || '',
        socialLinks: initialData.socialLinks || []
      });
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const updatedUser = await UserApi.updateUserProfile(formData);
      onUpdate(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleSocialLinksChange = (index: number, value: string) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index] = value;
    setFormData({ ...formData, socialLinks: newLinks });
  };

  const addSocialLinks = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, '']
    })
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="title">Professional Title</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number</label>
        <input
          type="tel"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Social Links</label>
        <div className="social-links">
          {formData.socialLinks?.map((link, index) => (
            <div key={index} className="social-link-input">
              <input
                type="url"
                value={link}
                onChange={(e) => handleSocialLinksChange(index, e.target.value)}
                placeholder="https://"
              />
              <button
                type="button"
                onClick={() => {
                  const newLinks = [...formData.socialLinks];
                  newLinks.splice(index, 1);
                  setFormData({ ...formData, socialLinks: newLinks });
                }}
                className="remove-link-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSocialLinks}
            className="add-link-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Another Link
          </button>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;