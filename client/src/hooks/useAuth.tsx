import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYER' | 'JOB_SEEKER';
}

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

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Checking authentication status...');
      
      const token = localStorage.getItem('jobPortalToken');
      if (!token) {
        console.log('No token found in localStorage');
        setUser(null);
        return;
      }
          
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Auth check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth data received:', data);
        setUser(data.user);
        console.log('User authenticated as:', data.user?.role || 'Unknown role');
      } else {
        // Invalid or expired token
        console.log('Invalid token or unauthorized. Clearing token.');
        localStorage.removeItem('jobPortalToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    console.log('Manually refreshing auth status...');
    await checkAuthStatus();
  }, [checkAuthStatus]);
  
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    refreshAuth
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 