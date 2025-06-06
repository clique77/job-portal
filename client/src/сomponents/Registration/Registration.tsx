import { useState, FormEvent, ChangeEvent } from 'react';
import './Registration.scss';
import { UserApi, UserRole, RegisterData } from '../../api/UserApi';


const Registration = () => {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    role: UserRole.JOB_SEEKER,
  })

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setEmailSent(false);

    try {
      await UserApi.register(formData);
      setSuccess('Registration successful');
      setEmailSent(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.JOB_SEEKER
      });
      // Do not navigate to login immediately
    } catch (error) {
      setError((error instanceof Error) ? error.message : 'An unexpected error');
      console.error('Registration error: ', error);
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="container">
        <main>
          <section className="register-section">
            <h2>Registration Successful</h2>
            <div className="success-message">
              Please check your email and follow the link to verify your account before logging in.
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <main>
        <section className="register-section">
          <h2>User Registration</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

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

            <div className="form-group">
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value={UserRole.JOB_SEEKER}>Job Seeker</option>
                <option value={UserRole.EMPLOYER}>Employer</option>
              </select>
            </div>
            <button type="submit" disabled={loading}>
              Register
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default Registration;
