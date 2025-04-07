import Registration from './сomponents/Registration/Registration';
import JobList from './сomponents/Jobs/JobList/JobList';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './сomponents/NavBar/NavBar';
import Authentication from './сomponents/Authentication/Authentication';
import { useState, useEffect, JSX } from 'react';
import { User, UserApi } from './api/UserApi';
import Profile from './сomponents/Profile/Profile';

const ProtectedRoute = ({ user, children }: { user: User | null, children: JSX.Element}) => {
  if (!user) {
    return <Navigate to='/login' replace />;
  }
  return children;
}

function AppContent() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('jobPortalUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userData = await UserApi.getCurrentUser();
        if (!userData) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [user?.id]);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await UserApi.logout();
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
              <Profile user={user} />
            </ProtectedRoute>
          } />
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
