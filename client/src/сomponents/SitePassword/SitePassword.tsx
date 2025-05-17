import { useState, useEffect } from 'react';
import './SitePassword.scss';

const SITE_PASSWORD = import.meta.env.VITE_PASSWORD;
const LOCAL_STORAGE_KEY = 'site_access_granted';

interface SitePasswordProps {
  onAccessGranted: () => void;
}

const SitePassword: React.FC<SitePasswordProps> = ({ onAccessGranted }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasAccess = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (hasAccess === 'true') {
      setIsVisible(false);
      onAccessGranted();
    }
  }, [onAccessGranted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      setIsVisible(false);
      onAccessGranted();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="site-password-overlay">
      <div className="site-password-modal">
        <h2>Welcome</h2>
        <p>Please enter the site password to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password"
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          <button type="submit">Enter Site</button>
        </form>
      </div>
    </div>
  );
};

export default SitePassword; 