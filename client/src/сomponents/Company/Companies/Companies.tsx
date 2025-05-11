import { useState, useEffect, useCallback } from 'react';
import CompanyApi, { UserCompany } from '../../../api/CompanyApi';
import './Companies.scss';
import CompanyCard from '../CompanyCard/CompanyCard';
import CreateCompanyForm from '../CreateCompanyForm/CreateCompanyForm';
import DeleteCompanyModal from '../DeleteCompanyModal/DeleteCompanyModal';

const Companies: React.FC = () => {
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<{id: string, name: string} | null>(null);

  const cleanupInvalidData = (companies: UserCompany[]) => {
    return companies.filter(uc => {
      if (!uc.companyId) return false;
      if (typeof uc.companyId === 'object' && uc.companyId !== null) {
        return !!(uc.companyId as any)._id && (uc.companyId as any)._id !== null;
      }
      return true;
    });
  };

  const fetchCompanies = useCallback(async () => {
    setError(null);
    try {
      const companies = await CompanyApi.getUserCompanies();
      
      const cleanCompanies = cleanupInvalidData(companies);
      setUserCompanies(cleanCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch companies. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies, refreshCounter]);

  const handleCreateCompany = async () => {
    setShowCreateForm(false);
    
    setRefreshCounter(c => c + 1);
    
    setTimeout(() => {
      fetchCompanies();
    }, 1000);
  };

  const confirmDeleteCompany = (companyId: any, companyName: string) => {
    if (!companyId) {
      setError('Cannot delete: Invalid company ID');
      return;
    }
    
    let actualCompanyId;
    let actualCompanyName = companyName || 'this company';
    
    if (typeof companyId === 'object' && companyId !== null) {
      if ('_id' in companyId) {
        actualCompanyId = companyId._id;
        if ('name' in companyId) {
          actualCompanyName = companyId.name;
        }
      } else {
        setError('Failed to identify company for deletion.');
        return;
      }
    } else {
      actualCompanyId = companyId;
    }

    setCompanyToDelete({id: actualCompanyId, name: actualCompanyName});
    setDeleteModalOpen(true);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    try {
      const success = await CompanyApi.deleteCompany(companyToDelete.id);
      
      if (success) {
        setUserCompanies(prev => prev.filter(uc => {
          if (typeof uc.companyId === 'string') {
            return uc.companyId !== companyToDelete.id;
          }
          if (typeof uc.companyId === 'object' && uc.companyId !== null) {
            return (uc.companyId as any)._id !== companyToDelete.id;
          }
          return true;
        }));
        
        setTimeout(() => {
          setRefreshCounter(c => c + 1);
        }, 500);
      } else {
        setError('Failed to delete company. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Failed to delete company. Please try again.');
    }
    
    setDeleteModalOpen(false);
    setCompanyToDelete(null);
  };

  const cancelDeleteCompany = () => {
    setDeleteModalOpen(false);
    setCompanyToDelete(null);
  };

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
        {error && <div className="error-message">{error}</div>}

        {userCompanies.length === 0 ? (
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

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="close-modal" 
              onClick={() => setShowCreateForm(false)}
            >
              &times;
            </button>
            <CreateCompanyForm 
              onSubmit={handleCreateCompany}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}
      
      <DeleteCompanyModal
        isOpen={deleteModalOpen}
        companyName={companyToDelete?.name || 'this company'}
        onConfirm={handleDeleteCompany}
        onCancel={cancelDeleteCompany}
      />
    </div>
  );
};

export default Companies; 