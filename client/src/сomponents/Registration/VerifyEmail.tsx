import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './VerifyEmail.scss';

const VerifyEmail = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/verify-email/${token}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email successfully verified! You can now log in.');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          if (data.message === 'Invalid verification token') {
            setMessage('This verification link has already been used or has expired. Please try logging in or request a new verification email.');
          } else {
            setMessage(data.message || 'Verification failed. Please try again or request a new verification email.');
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Failed to verify email. Please check your connection and try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="container">
      <main>
        <section className="verify-email-section">
          <h2>Email Verification</h2>
          {status === 'loading' && <div className="loading">Verifying...</div>}
          {status === 'success' && <div className="success-message">{message}</div>}
          {status === 'error' && (
            <div className="error-message">
              {message}
              <button 
                onClick={() => navigate('/login')}
                className="back-to-login"
              >
                Back to Login
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default VerifyEmail; 