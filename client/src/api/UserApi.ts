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
  title: string;
  bio: string;
  location: string;
  phoneNumber: string;
  socialLinks: string[];
  profilePicture: string;
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

export const storage = {
  saveUser: (user: User) => {
    localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(user));
  },
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
          storage.saveUser(user);
          return user;
        }

        if (response.status === 401) {
          console.error('Token is invalid or expired, clearing auth');
          storage.clearAuth();
          return null;
        }
        
        console.warn('Error fetching current user, using cached data');
        return storedUser;
      } catch (error) {
        console.warn('Network error when fetching user, using cached data', error);
        return storedUser;
      }
    }

    return null;
  },

  updateUserProfile: async (userData: Partial<User>): Promise<User> => {
    const token = storage.getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const { user } = await response.json();
    storage.saveUser(user);
    return user;
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<User> => {
    const token = storage.getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update password');
    }

    const { user } = await response.json();
    return user;
  },

  updateProfilePicture: async (file: File): Promise<User> => {
    const token = storage.getToken();
    const formData = new FormData();
    formData.append('profilePicture', file);

    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Uploading to:", `${API_BASE_URL}/api/users/profile-picture`);
    console.log("Token present:", !!token);
    console.log("File being uploaded:", file.name, file.type, file.size);
    
    const response = await fetch(`${API_BASE_URL}/api/users/profile-picture`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: formData
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error("Upload error response:", error);
      throw new Error(error.message || 'Failed to update profile picture');
    }

    const result = await response.json();
    console.log("Upload success response:", result);
    const { user: updatedUserData } = result;
    
    const existingUser = storage.getUser();
    const mergedUser = existingUser ? { ...existingUser, ...updatedUserData } : updatedUserData;
    
    console.log("Saving merged user to storage:", mergedUser);
    console.log("User profile picture URL:", mergedUser.profilePicture);
    
    storage.saveUser(mergedUser);
    return mergedUser;
  }
};