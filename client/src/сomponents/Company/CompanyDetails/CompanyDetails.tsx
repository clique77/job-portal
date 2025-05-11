import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyApi, { Company, UserCompany, CompanyRole } from '../../../api/CompanyApi';
import EditCompanyForm from '../EditCompanyForm/EditCompanyForm';
import DeleteCompanyModal from '../DeleteCompanyModal/DeleteCompanyModal';
import './CompanyDetails.scss';

const CompanyDetails: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [userCompany, setUserCompany] = useState<UserCompany | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const companyData = await CompanyApi.getCompanyById(companyId);
        
        if (!companyData) {
          setError('Company not found');
          setIsLoading(false);
          return;
        }
        
        setCompany(companyData);
        
        const userCompanies = await CompanyApi.getUserCompanies();
        
        const userCompanyRelation = userCompanies.find(uc => {
          if (uc.companyId === companyId) return true;
          
          if (typeof uc.companyId === 'object' && uc.companyId !== null && '_id' in uc.companyId) {
            return (uc.companyId as any)._id === companyId;
          }
          
          if (uc.company && (uc.company._id === companyId || uc.company.id === companyId)) {
            return true;
          }
          
          return false;
        });
        
        
        setUserCompany(userCompanyRelation || null);
        
        if (userCompanyRelation) {
          const companyMembers = await CompanyApi.getCompanyMembers(companyId);
          setMembers(companyMembers);
        }
      } catch (err) {
        setError('Failed to load company details');
        console.error('Error fetching company details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    setIsEditing(false);
  };

  const handleDeleteCompany = async () => {
    if (!companyId) return;

    try {
      const success = await CompanyApi.deleteCompany(companyId);
      if (success) {
        navigate('/companies');
      } else {
        setError('Failed to delete company');
      }
    } catch (err) {
      setError('Error deleting company');
      console.error('Delete company error:', err);
    }
  };

  const isOwner = userCompany?.role === CompanyRole.OWNER;
  const isAdmin = userCompany?.role === CompanyRole.ADMIN;
  const canEdit = isOwner || isAdmin;

  if (isLoading) {
    return <div className="loading-spinner">Loading company details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!company) {
    return <div className="not-found">Company not found</div>;
  }

  if (isEditing) {
    return (
      <div className="company-details-container">
        <EditCompanyForm 
          companyId={companyId || ''}
          onSubmit={handleUpdateCompany}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="company-details-container">
      <header className="company-header">
        <div className="company-logo">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={`${company.name} logo`} />
          ) : (
            <div className="company-initials">
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="company-title">
          <h1>{company.name}</h1>
          {userCompany && <p className="user-role">Your role: {userCompany.role}</p>}
        </div>
        
        {canEdit && (
          <div className="company-actions">
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Company
            </button>
            
            {isOwner && (
              <button 
                className="delete-btn"
                onClick={() => setShowDeleteModal(true)}
                aria-label="Delete company"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </header>
      
      <section className="company-section">
        <h2>About</h2>
        <p className="company-description">{company.description}</p>
      </section>
      
      {userCompany && (
        <section className="company-section">
          <h2>Team Members ({members.length})</h2>
          
          {members.length > 0 ? (
            <div className="members-list">
              {members.map((member: any) => (
                <div key={member.userId || (member.user && member.user._id)} className="member-item">
                  <div className="member-name">{member.user?.name || 'Unknown User'}</div>
                  <div className="member-role">{member.role || 'Member'}</div>
                  {(isOwner || (isAdmin && member.role !== CompanyRole.OWNER)) && (
                    <div className="member-actions">
                      {/* Member actions would go here */}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No team members found.</p>
          )}
        </section>
      )}

      <DeleteCompanyModal
        isOpen={showDeleteModal}
        companyName={company.name}
        onConfirm={handleDeleteCompany}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default CompanyDetails; 