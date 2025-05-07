import Registration from './сomponents/Registration/Registration';
import JobList from './сomponents/Jobs/JobList/JobList';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './сomponents/NavBar/NavBar';
import Authentication from './сomponents/Authentication/Authentication';
import { useState, useEffect, JSX, useCallback } from 'react';
import { User, UserApi, storage } from './api/UserApi';
import Profile from './сomponents/Profile/Profile';
import SavedJobs from './сomponents/Jobs/SavedJobs/SavedJobs';

const ProtectedRoute = ({ user, children }: { user: User | null, children: JSX.Element}) => {
  if (!user) {
    return <Navigate to='/login' replace />;
  }
  return children;
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyAuth = useCallback(async () => {
    const token = storage.getToken();
    
    if (!token) {
      console.log('No token found, user is not authenticated');
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Verifying authentication...');
      const userData = await UserApi.getCurrentUser();
      
      if (userData && userData.id && userData.email) {
        console.log('Authentication successful, user data loaded:', userData.email);
        setUser(userData);
      } else {
        console.log('Authentication failed, no valid user data returned');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth verification error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleUserUpdate = (updatedUser: User) => {
    if (updatedUser) {
      storage.saveUser(updatedUser);
      setUser(updatedUser);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await UserApi.logout();
      storage.clearAuth();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className='navigation'>
        <NavBar user={user} isLoading={isLoading} onLogout={handleLogout} /> 
      </div>
      <div className='App'>
        <Routes>
          <Route path='/' element={<JobList/>} >
            <Route path='/jobs/:jobId' element={<JobList/>} />
          </Route>
          <Route path='/registration' element={<Registration/>} />
          <Route path='/login' element={<Authentication onLoginSuccess={handleLoginSuccess} />} />
          <Route path='/profile' element={
            <ProtectedRoute user={user}>
              <Profile user={user} onUserUpdate={handleUserUpdate} />
            </ProtectedRoute>
          } />
          <Route path='/saved-jobs' element={
            <ProtectedRoute user={user}>
              <SavedJobs />
            </ProtectedRoute>
          }>
            <Route path='/saved-jobs/:jobId' element={
              <ProtectedRoute user={user}>
                <SavedJobs />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;