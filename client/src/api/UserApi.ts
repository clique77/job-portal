const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export enum UserRole {
  JOB_SEEKER = 'job_seeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  bio: string;
  location: string;
  phoneNumber: string;
  socialLinks: string[];
  profilePicture: string;
  workExperience: {
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description: string;
  }[];
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
    let normalizedUser = user;
    if (user && user._id && !user.id) {
      normalizedUser = {
        ...user,
        id: user._id
      };
    }
    
    if (!normalizedUser || !normalizedUser.id || !normalizedUser.email || !normalizedUser.role) {
      console.error('Attempted to save invalid user data to storage');
      return;
    }
    localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(normalizedUser));
  },
  saveAuth: (authData: AuthResponse) => {
    let normalizedAuthData = {...authData};
    if (authData.user && authData.user._id && !authData.user.id) {
      normalizedAuthData.user = {
        ...authData.user,
        id: authData.user._id
      };
    }
    
    if (!normalizedAuthData || !normalizedAuthData.user || !normalizedAuthData.token || 
        !normalizedAuthData.user.id || !normalizedAuthData.user.email || !normalizedAuthData.user.role) {
      console.error('Attempted to save invalid auth data to storage');
      return;
    }
    localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(normalizedAuthData.user));
    localStorage.setItem(STORAGE_KEY.TOKEN, normalizedAuthData.token);
  },
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEY.USER);
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      
      let normalizedUser = parsed;
      if (parsed && parsed._id && !parsed.id) {
        normalizedUser = {
          ...parsed,
          id: parsed._id
        };
      }
      
      if (!normalizedUser || !normalizedUser.id || !normalizedUser.email || !normalizedUser.role) {
        console.warn('Invalid user data in storage, clearing');
        localStorage.removeItem(STORAGE_KEY.USER);
        return null;
      }
      return normalizedUser;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      localStorage.removeItem(STORAGE_KEY.USER);
      return null;
    }
  },
  getToken: (): string | null => {
    const token = localStorage.getItem(STORAGE_KEY.TOKEN);
    if (!token || token.trim() === '') {
      localStorage.removeItem(STORAGE_KEY.USER);
      return null;
    }
    return token;
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
    
    if (data.user && data.user._id && !data.user.id) {
      data.user = {
        ...data.user,
        id: data.user._id
      };
    }
    
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
    
    if (responseData.user && responseData.user._id && !responseData.user.id) {
      responseData.user = {
        ...responseData.user,
        id: responseData.user._id
      };
    }
    
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
    const token = storage.getToken();
    if (!token) return null;

    try {
      console.log('Fetching current user with token:', token.substring(0, 10) + '...');
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        cache: 'no-cache'
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('API response data:', JSON.stringify(responseData).substring(0, 100) + '...');
        
        let userData = responseData.user || responseData;
        
        if (userData && userData._id && !userData.id) {
          userData = {
            ...userData,
            id: userData._id
          };
        }
        
        if (userData && userData.id && userData.email) {
          console.log('Valid user data received, id:', userData.id, 'email:', userData.email);
          storage.saveUser(userData);
          return userData;
        } else {
          console.error('Invalid user data received from server:', JSON.stringify(responseData));
          storage.clearAuth();
          return null;
        }
      }

      if (response.status === 401) {
        console.warn('Authentication token is invalid or expired');
        storage.clearAuth();
        return null;
      }
      
      // For non-401 errors, try to use cached user data if available
      const storedUser = storage.getUser();
      if (storedUser && storedUser.id && storedUser.email) {
        console.warn('Server error, using cached user data:', storedUser.email);
        return storedUser;
      }
      
      storage.clearAuth();
      return null;
    } catch (error) {
      console.warn('Network error when fetching user data:', error);
      
      // For network errors, also try to use cached user data
      const storedUser = storage.getUser();
      if (storedUser && storedUser.id && storedUser.email) {
        console.log('Using cached user during network error:', storedUser.email);
        return storedUser;
      }
      
      return null;
    }
  },

  updateUserProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.getToken()}`
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const { user } = await response.json();
    
    let transformedUser = user;
    if (user && user._id && !user.id) {
      transformedUser = {
        ...user,
        id: user._id
      };
    }
    
    return transformedUser;
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
    
    let transformedUser = user;
    if (user && user._id && !user.id) {
      transformedUser = {
        ...user,
        id: user._id
      };
    }
    
    return transformedUser;
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
    
    let transformedUserData = updatedUserData;
    if (updatedUserData && updatedUserData._id && !updatedUserData.id) {
      transformedUserData = {
        ...updatedUserData,
        id: updatedUserData._id
      };
    }
    
    const existingUser = storage.getUser();
    const mergedUser = existingUser ? { ...existingUser, ...transformedUserData } : transformedUserData;
    
    console.log("Saving merged user to storage:", mergedUser);
    console.log("User profile picture URL:", mergedUser.profilePicture);
    
    storage.saveUser(mergedUser);
    return mergedUser;
  }
};