import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { storage, User } from '../api/UserApi';
import { getAuthHeaders } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  refreshAuth: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check if we're already authenticated from localStorage
  useEffect(() => {
    const storedUser = storage.getUser();
    if (storedUser && storedUser.id && storedUser.email) {
      console.log('Found stored user in useAuth init:', storedUser.email);
      setUser(storedUser);
    }
  }, []);

  // Listen for app-level authentication changes
  useEffect(() => {
    const handleAppAuthUpdate = () => {
      const storedUser = storage.getUser();
      if (storedUser && storedUser.id && storedUser.email) {
        setUser(storedUser);
      }
    };

    // Check for auth updates regularly
    const authCheckInterval = setInterval(() => {
      handleAppAuthUpdate();
    }, 2000);

    // Listen for storage events (when localStorage changes)
    window.addEventListener('storage', handleAppAuthUpdate);

    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleAppAuthUpdate);
    };
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('useAuth: Checking authentication status...');
      
      const token = localStorage.getItem('jobPortalToken');
      if (!token) {
        console.log('useAuth: No token found in localStorage');
        setUser(null);
        return;
      }
          
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
        cache: 'no-store'
      });
      
      console.log('useAuth check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('useAuth data received:', data);
        
        let userData = data.user || data;
        
        if (userData && userData._id && !userData.id) {
          userData = {
            ...userData,
            id: userData._id
          };
        }
        
        if (userData && userData.id && userData.email) {
          console.log('useAuth: Valid user data received');
          storage.saveUser(userData);
          setUser(userData);
          
          // Create a storage event to notify other components
          window.dispatchEvent(new Event('auth-updated'));
        } else {
          console.error('useAuth: Invalid user data received');
          
          // Try to use cached user if API returns invalid data
          const cachedUser = storage.getUser();
          if (cachedUser && cachedUser.id && cachedUser.email) {
            console.log('useAuth: Using cached user data');
            setUser(cachedUser);
          } else {
            setUser(null);
          }
        }
      } else if (response.status === 401) {
        // Check if we're already running the app-level auth refresh
        const isAppRefreshing = localStorage.getItem('authCheckInProgress');
        if (isAppRefreshing === 'true') {
          console.log('useAuth: App-level auth refresh in progress, using cached data');
          
          // Try to use cached user if API returns unauthorized
          const cachedUser = storage.getUser();
          if (cachedUser && cachedUser.id && cachedUser.email) {
            console.log('useAuth: Using cached user data during app refresh');
            setUser(cachedUser);
          } else {
            localStorage.removeItem('jobPortalToken');
            setUser(null);
          }
        } else {
          // No app-level refresh running, clear auth
          console.log('useAuth: Invalid token or unauthorized.');
          localStorage.removeItem('jobPortalToken');
          setUser(null);
        }
      } else {
        // For non-401 errors, use cached data if available
        const cachedUser = storage.getUser();
        if (cachedUser && cachedUser.id && cachedUser.email) {
          console.log('useAuth: Using cached user data for non-401 error');
          setUser(cachedUser);
        } else {
        setUser(null);
        }
      }
    } catch (error) {
      console.error('useAuth check error:', error);
      
      // Try to use cached user data on error
      const cachedUser = storage.getUser();
      if (cachedUser && cachedUser.id && cachedUser.email) {
        console.log('useAuth: Using cached user on error');
        setUser(cachedUser);
      } else {
      setUser(null);
      }
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    console.log('useAuth: Manually refreshing auth status...');
    await checkAuthStatus();
  }, [checkAuthStatus]);
  
  useEffect(() => {
    checkAuthStatus();
    
    // Setup auth refresh interval
    const refreshInterval = setInterval(() => {
      const lastCheck = localStorage.getItem('lastAuthCheck');
      const now = Date.now();
      
      // Only refresh if last check was more than 5 minutes ago and we're not already refreshing
      if ((!lastCheck || now - parseInt(lastCheck) > 5 * 60 * 1000) && 
          localStorage.getItem('authCheckInProgress') !== 'true') {
        console.log('useAuth: Running periodic auth refresh');
        checkAuthStatus();
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [checkAuthStatus]);
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading && !initialized,
    refreshAuth
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 