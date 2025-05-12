import { storage } from '../api/UserApi';

/**
 * Get authentication headers for API requests
 * This centralized function ensures consistent auth header handling across the app
 * 
 * @param includeContentType Whether to include Content-Type header
 * @returns HeadersInit object with auth headers
 */
export const getAuthHeaders = (includeContentType = true): HeadersInit => {
  // Always get fresh token from storage
  const token = storage.getToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No auth token found for request');
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

/**
 * Check if authentication is currently being verified by App.tsx
 * to avoid race conditions between components and global auth
 */
export const isAuthVerifying = (): boolean => {
  // Check if App.tsx has completed its initial auth check
  const authCheck = localStorage.getItem('authCheckInProgress');
  if (authCheck === 'true') {
    return true;
  }
  
  // Also check how recently the auth check started
  const lastAuthCheckStart = localStorage.getItem('lastAuthCheckStart');
  if (lastAuthCheckStart) {
    const timeSinceStart = Date.now() - parseInt(lastAuthCheckStart);
    // If auth check started in the last 2 seconds, consider it in progress
    if (timeSinceStart < 2000) {
      return true;
    }
  }
  
  return false;
};

/**
 * Handle response from API with standardized auth error handling
 * This helps prevent unnecessary token clearing for temporary server issues
 * 
 * @param response Fetch API Response object
 * @returns Response if successful, otherwise throws error
 */
export const handleApiResponse = async (response: Response) => {
  if (response.ok) {
    return response;
  }
  
  // Handle authentication errors (401)
  if (response.status === 401) {
    console.warn('Received 401 Unauthorized response from API');
    
    // If auth verification is in progress, don't immediately clear credentials
    if (isAuthVerifying()) {
      console.log('Auth verification in progress, delaying error response');
      throw new Error('Authentication check in progress');
    }
    
    // Check if this is a persistent issue
    const lastAuthFailTime = localStorage.getItem('lastAuthFailTime');
    const now = Date.now();
    
    if (lastAuthFailTime && now - parseInt(lastAuthFailTime) < 10000) {
      // Multiple 401s in quick succession - likely a real auth issue
      console.error('Multiple auth failures detected, clearing credentials');
      
      // Store that we're about to clear auth
      localStorage.setItem('authClearRequested', 'true');
      
      // First set cached time to avoid redirect loops
      const cachedLogoutTime = Date.now().toString();
      localStorage.setItem('lastLogoutTime', cachedLogoutTime);
      
      // Clear all auth data
      storage.clearAuth();
      
      // Wait a brief moment before redirecting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else {
      // First recent 401, just record it
      localStorage.setItem('lastAuthFailTime', now.toString());
    }
    
    throw new Error('Authentication failed');
  }
  
  // Handle other errors
  try {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error (${response.status})`);
  } catch (e) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
};

/**
 * Safely parse JSON with error handling
 */
export const safeJsonParse = (data: string | null, fallback: any = null) => {
  if (!data) return fallback;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}; 