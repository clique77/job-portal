import { useState, FormEvent, ChangeEvent } from 'react';
import './Registration.scss';

enum UserRole {
  JOB_SEEKER = 'job_seeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface RegisterResponse {
  user: User;
  token: string;
}

interface ApiError {
  message: string;
}

const Registration = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    role: UserRole.JOB_SEEKER,
  })

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [userData, setUserData] = useState<RegisterResponse | null>(null);

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

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      const data: RegisterResponse | ApiError = await response.json();

      if (!response.ok) {
        throw new Error((data as ApiError).message || 'Registration failed');
      }

      setSuccess('Registration successfull');
      setUserData(data as RegisterResponse);

      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.JOB_SEEKER
      })
    } catch (error) {
      setError((error instanceof Error) ? error.message : 'An unexpected error');
      console.error('Registration error: ', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Портал вакансій</h1>
      </header>

      <main>
        <section className="register-section">
          <h2>Реєстрація користувача</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <label htmlFor="name">Ім'я:</label>
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
              <label htmlFor="password">Пароль:</label>
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
              <label htmlFor="role">Роль:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value={UserRole.JOB_SEEKER}>Шукач роботи</option>
                <option value={UserRole.EMPLOYER}>Роботодавець</option>
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Реєстрація...' : 'Зареєструватися'}
            </button>
          </form>
        </section>

        {userData && (
          <section className="user-info">
            <h2>Інформація про зареєстрованого користувача</h2>
            <div className="user-card">
              <p><strong>Ім'я:</strong> {userData.user.name}</p>
              <p><strong>Email:</strong> {userData.user.email}</p>
              <p><strong>Роль:</strong> {userData.user.role}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default Registration;
