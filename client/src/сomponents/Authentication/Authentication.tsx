import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserApi, LoginData, User, storage } from '../../api/UserApi';
import './Authentication.scss';

export interface AuthenticationProps {
  onLoginSuccess: (user: User) => void;
}

const Authentication = ({ onLoginSuccess }: AuthenticationProps) => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await UserApi.login(formData);
      console.log('Login response received:', 
        response ? `token: ${response.token ? '✓' : '✗'}, user: ${response.user ? '✓' : '✗'}` : 'null');
      
      if (response && response.user && response.token) {
        // Manually ensure token is set correctly in case the API save didn't work
        localStorage.setItem('jobPortalToken', response.token);
        // Use the storage helper for consistency
        storage.saveUser(response.user);
        
        onLoginSuccess(response.user);
        navigate('/');
      } else {
        throw new Error('Login response missing user or token data');
      }
    } catch (error) {
      setError((error instanceof Error) ? error.message : 'An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <main>
        <section className="login-section">
          <h2>Login</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Authentication; 