import { useState, useEffect, useCallback } from 'react';
import CompanyApi, { UserCompany } from '../../../api/CompanyApi';
import './Companies.scss';
import CompanyCard from '../CompanyCard/CompanyCard';
import CreateCompanyForm from '../CreateCompanyForm/CreateCompanyForm';
import DeleteCompanyModal from '../DeleteCompanyModal/DeleteCompanyModal';
import { storage } from '../../../api/UserApi';
import { useNavigate } from 'react-router-dom';

const Companies: React.FC = () => {
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<{id: string, name: string} | null>(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const navigate = useNavigate();

  const cleanupInvalidData = (companies: UserCompany[]) => {
    return companies.filter(uc => {
      if (!uc.companyId) return false;
      if (typeof uc.companyId === 'object' && uc.companyId !== null) {
        return !!(uc.companyId as any)._id && (uc.companyId as any)._id !== null;
      }
      return true;
    });
  };

  // Separate auth check from data fetching
  useEffect(() => {
    const authCheckTimer = setTimeout(() => {
      const token = storage.getToken();
      
      if (!token) {
        console.warn('No auth token found - redirecting to login');
        navigate('/login');
      } else {
        console.log('Auth token found, proceeding with component initialization');
        setAuthCheckComplete(true);
      }
    }, 800); // Short delay to allow App.tsx auth check to complete
    
    return () => clearTimeout(authCheckTimer);
  }, [navigate]);

  const fetchCompanies = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Try to get cached companies while loading
      const cachedCompanies = localStorage.getItem('cachedUserCompanies');
      if (cachedCompanies) {
        try {
          const parsed = JSON.parse(cachedCompanies);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('Using cached companies while fetching fresh data');
            setUserCompanies(cleanupInvalidData(parsed));
          }
        } catch (e) {
          console.warn('Failed to parse cached companies:', e);
        }
      }
      
      const companies = await CompanyApi.getUserCompanies();
      const cleanCompanies = cleanupInvalidData(companies);
      setUserCompanies(cleanCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch companies. Please try again.');
      
      if (err instanceof Error && err.message === 'Authentication failed') {
        console.warn('Authentication error when fetching companies');
        const cachedCompanies = localStorage.getItem('cachedUserCompanies');
        if (cachedCompanies) {
          try {
            const parsed = JSON.parse(cachedCompanies);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log('Using cached companies due to auth error');
              setUserCompanies(cleanupInvalidData(parsed));
              setError(null);
            }
          } catch (e) {
            console.warn('Failed to parse cached companies:', e);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authCheckComplete) {
      fetchCompanies();
    }
  }, [fetchCompanies, refreshCounter, authCheckComplete]);

  const handleRetryFetch = () => {
    setRefreshCounter(prev => prev + 1);
  };

  const handleCreateCompany = () => {
    setShowCreateForm(false);
    setRefreshCounter(c => c + 1);
  };

  const handleDeleteCompany = async (companyId: string | object) => {
    setDeleteModalOpen(false);
    setCompanyToDelete(null);
    
    try {
      let id: string;
      if (typeof companyId === 'object' && companyId !== null && '_id' in companyId) {
        id = (companyId as any)._id;
      } else if (typeof companyId === 'string') {
        id = companyId;
      } else {
        throw new Error('Invalid company ID');
      }
      
      await CompanyApi.deleteCompany(id);
      
      setRefreshCounter(c => c + 1);
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Failed to delete company. Please try again.');
    }
  };

  const confirmDeleteCompany = (companyId: string | object, companyName: string) => {
    let id: string;
    if (typeof companyId === 'object' && companyId !== null && '_id' in companyId) {
      id = (companyId as any)._id;
    } else if (typeof companyId === 'string') {
      id = companyId;
    } else {
      console.error('Invalid company ID:', companyId);
      return;
    }
    
    setCompanyToDelete({ id, name: companyName });
    setDeleteModalOpen(true);
  };

  if (!authCheckComplete) {
    return (
      <div className="companies-container">
        <div className="companies-content">
          <div className="loading-companies">
            <p>Verifying authentication...</p>
            <div className="loading-shimmer"></div>
            <div className="loading-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="companies-container">
      <div className="companies-page-header">
        <div className="companies-header">
          <h1>My Companies</h1>
          <button 
            className="create-company-btn"
            onClick={() => setShowCreateForm(true)}
          >
            + Create Company
          </button>
        </div>
      </div>

      <div className="companies-content">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={handleRetryFetch} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-companies">
            <p>Loading your companies...</p>
            <div className="loading-shimmer"></div>
            <div className="loading-shimmer"></div>
          </div>
        ) : userCompanies.length === 0 ? (
          <div className="no-companies">
            <p>You don't have any companies yet.</p>
            <p>Create a company to start posting jobs!</p>
          </div>
        ) : (
          <div className="companies-grid">
            {userCompanies.map(userCompany => (
              <CompanyCard 
                key={userCompany._id || (typeof userCompany.companyId === 'object' && userCompany.companyId !== null ? (userCompany.companyId as any)?._id : userCompany.companyId) || Math.random().toString()}
                userCompany={userCompany}
                onDelete={() => {
                  const companyName = typeof userCompany.companyId === 'object' && userCompany.companyId !== null && 'name' in userCompany.companyId 
                    ? (userCompany.companyId as any).name 
                    : (userCompany.company?.name || 'this company');
                  confirmDeleteCompany(userCompany.companyId, companyName);
                }}
              />
            ))}
          </div>
        )}
      </div>

        <CreateCompanyForm 
          onCancel={() => setShowCreateForm(false)}
          onSubmit={handleCreateCompany}
        isOpen={showCreateForm}
        />

      {deleteModalOpen && companyToDelete && (
        <DeleteCompanyModal
          isOpen={deleteModalOpen}
          companyName={companyToDelete.name}
          onCancel={() => {
            setDeleteModalOpen(false);
            setCompanyToDelete(null);
          }}
          onConfirm={() => handleDeleteCompany(companyToDelete.id)}
        />
      )}
    </div>
  );
}

export default Companies; 