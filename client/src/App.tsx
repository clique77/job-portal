import Registration from './сomponents/Registration/Registration';
import JobList from './сomponents/Jobs/JobList/JobList';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './сomponents/NavBar/NavBar';
import Authentication from './сomponents/Authentication/Authentication';
import { useState, useEffect, JSX } from 'react';
import { User, UserApi, UserRole, storage } from './api/UserApi';
import Profile from './сomponents/Profile/Profile';
import SavedJobs from './сomponents/Jobs/SavedJobs/SavedJobs';
import RoleBasedRoute from './сomponents/Authentication/RoleBasedRoute';
import Companies from './сomponents/Company/Companies/Companies';
import CompanyDetails from './сomponents/Company/CompanyDetails/CompanyDetails';
import EmployerJobDetail from './сomponents/Jobs/EmployerJobDetail/EmployerJobDetail';
import MyApplications from './сomponents/Jobs/JobSeekerApplications/JobSeekerApplications';
import AdminDashboard from './сomponents/Admin/Dashboard/AdminDashboard';
import SitePassword from './сomponents/SitePassword/SitePassword';
import Landing from './сomponents/Landing/Landing';
import VerifyEmail from './сomponents/Registration/VerifyEmail';

const ProtectedRoute = ({ user, isLoading, children }: { user: User | null, isLoading: boolean, children: JSX.Element}) => {
  if (isLoading) {
    return <div className="loading-auth">Verifying authentication...</div>;
  }

  if (!user) {
    return <Navigate to='/login' replace />;
  }
  
  return children;
}


function AppContent() {
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    localStorage.setItem('authCheckInProgress', 'true');
    localStorage.setItem('lastAuthCheckStart', Date.now().toString());
    
    const performAuthCheck = async () => {
      const token = storage.getToken();
      
      if (!token) {
        console.log('No token found, user is not authenticated');
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
          localStorage.setItem('authCheckInProgress', 'false');
        }
        return;
      }
      
      if (isMounted) setIsLoading(true);
      
      try {
        console.log('Verifying authentication...');
        const userData = await UserApi.getCurrentUser();
        
        if (!isMounted) return; 
        
        if (userData && userData.id && userData.email) {
          console.log('Authentication successful, user data loaded:', userData.email);
          setUser(userData);
          retryCount = 0;
          
          localStorage.setItem('lastAuthCheck', Date.now().toString());
          localStorage.setItem('authCheckInProgress', 'false');
        } else {
          console.log('Authentication failed, no valid user data returned');
          
          const storedUser = storage.getUser();
          if (storedUser && storedUser.id && storedUser.email) {
            console.log('Using stored user data as fallback');
            setUser(storedUser);
          } else {
            setUser(null);
          }
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying authentication (${retryCount}/${maxRetries})...`);
            setTimeout(performAuthCheck, 2000);
          } else {
            localStorage.setItem('authCheckInProgress', 'false');
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Auth verification error:', error);
          
          const storedUser = storage.getUser();
          if (storedUser && storedUser.id && storedUser.email) {
            console.log('Using stored user data as fallback after error');
            setUser(storedUser);
          } else {
            setUser(null);
          }
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying authentication after error (${retryCount}/${maxRetries})...`);
            setTimeout(performAuthCheck, 3000);
          } else {
            localStorage.setItem('authCheckInProgress', 'false');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          if (retryCount >= maxRetries) {
            localStorage.setItem('authCheckInProgress', 'false');
          }
        }
      }
    };
    
    performAuthCheck();
    
    const checkAuthClearRequests = setInterval(() => {
      if (isMounted) {
        const authClearRequested = localStorage.getItem('authClearRequested');
        if (authClearRequested === 'true') {
          console.log('Auth clear requested from another component');
          localStorage.removeItem('authClearRequested');
          setUser(null);
        }
      }
    }, 1000);
    
    const authRefreshInterval = setInterval(() => {
      if (isMounted) {
        const lastCheck = localStorage.getItem('lastAuthCheck');
        const now = Date.now();
        if (!lastCheck || now - parseInt(lastCheck) > 15 * 60 * 1000) {
          console.log('Performing periodic auth refresh...');
          localStorage.setItem('authCheckInProgress', 'true');
          localStorage.setItem('lastAuthCheckStart', Date.now().toString());
          performAuthCheck();
        }
      }
    }, 10 * 60 * 1000);
    
    return () => {
      isMounted = false;
      localStorage.setItem('authCheckInProgress', 'false');
      clearInterval(authRefreshInterval);
      clearInterval(checkAuthClearRequests);
    };
  }, []);

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
  
  if (!isAccessGranted) {
    return <SitePassword onAccessGranted={() => setIsAccessGranted(true)} />;
  }

  return (
    <>
      <div className='navigation'>
        <NavBar user={user} isLoading={isLoading} onLogout={handleLogout} />
      </div>
      <div className='App'>
        <Routes>
          {/* Home page - Role-based redirect */}
          <Route path='/' element={
            user ? (
              user.role === UserRole.EMPLOYER ? 
                <Navigate to='/companies' replace /> : 
                user.role === UserRole.ADMIN ?
                  <Navigate to='/admin' replace /> :
                  <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.JOB_SEEKER, UserRole.ADMIN]}>
                    <JobList />
                  </RoleBasedRoute>
            ) : (
              <Landing />
            )
          } />
          
          {/* Job seeker routes */}
          <Route path='/jobs' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.JOB_SEEKER, UserRole.ADMIN]}>
              <JobList />
            </RoleBasedRoute>
          } />
          <Route path='/jobs/:jobId' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.JOB_SEEKER, UserRole.ADMIN]}>
              <JobList />
            </RoleBasedRoute>
          } />
          
          {/* Employer routes */}
          <Route path='/companies' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.EMPLOYER, UserRole.ADMIN]}>
              <Companies />
            </RoleBasedRoute>
          } />
          <Route path='/companies/:companyId' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.EMPLOYER, UserRole.ADMIN]}>
              <CompanyDetails user={user} />
            </RoleBasedRoute>
          } />
          <Route path='/companies/:companyId/edit' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.EMPLOYER, UserRole.ADMIN]}>
              <CompanyDetails user={user} />
            </RoleBasedRoute>
          } />
          {/* Special route for employers to view job applicants */}
          <Route path='/employer/jobs/:jobId' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.EMPLOYER, UserRole.ADMIN]}>
              <EmployerJobDetail />
            </RoleBasedRoute>
          } />
          
          {/* Admin routes */}
          <Route path='/admin' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard user={user} />
            </RoleBasedRoute>
          } />
          
          {/* Public routes */}
          <Route path='/registration' element={<Registration/>} />
          <Route path='/login' element={<Authentication onLoginSuccess={handleLoginSuccess} />} />
          <Route path='/verify-email' element={<VerifyEmail />} />
          
          {/* Protected routes for all logged-in users */}
          <Route path='/profile' element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <Profile user={user} onUserUpdate={handleUserUpdate} />
            </ProtectedRoute>
          } />
          <Route path='/saved-jobs' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.JOB_SEEKER, UserRole.ADMIN]}>
              <SavedJobs />
            </RoleBasedRoute>
          } />
          <Route path='/saved-jobs/:jobId' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.JOB_SEEKER, UserRole.ADMIN]}>
              <SavedJobs />
            </RoleBasedRoute>
          } />
          <Route path='/my-applications' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.JOB_SEEKER, UserRole.ADMIN]}>
              <MyApplications />
            </RoleBasedRoute>
          } />
          <Route path='/my-applications/:jobId' element={
            <RoleBasedRoute user={user} isLoading={isLoading} allowedRoles={[UserRole.JOB_SEEKER, UserRole.ADMIN]}>
              <MyApplications />
            </RoleBasedRoute>
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