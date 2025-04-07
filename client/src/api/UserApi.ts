const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export enum UserRole {
  JOB_SEEKER = 'job_seeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const STORAGE_KEY = {
  USER: 'jobPortalUser',
  TOKEN: 'jobPortalToken'
};

const storage = {
  saveAuth: (authData: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(authData.user));
    localStorage.setItem(STORAGE_KEY.TOKEN, authData.token);
  },
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEY.USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEY.TOKEN);
  },
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY.USER);
    localStorage.removeItem(STORAGE_KEY.TOKEN);
  }
};

export const UserApi = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    storage.saveAuth(data);
    return data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const responseData = await response.json();
    storage.saveAuth(responseData);
    return responseData;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    storage.clearAuth();

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }

    return response.json();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const storedUser = storage.getUser();
    const token = storage.getToken();

    if (storedUser && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        });

        if (response.ok) {
          const { user } = await response.json();
          return user;
        }

        storage.clearAuth();
        return null;
      } catch {
        return storedUser;
      }
    }

    return null;
  }
};