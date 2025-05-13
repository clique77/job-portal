import { useState, useEffect } from 'react';
import { storage } from '../../../api/UserApi';
import './CompaniesManagement.scss';

interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  logoUrl?: string;
  owner?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
}

interface CompanyFormData {
  id?: string;
  name: string;
  description: string;
  logoUrl?: string;
  ownerId?: string;
}

const CompaniesManagement = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Form state
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
  });

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the admin companies endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/companies`, {
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      
      const data = await response.json();
      console.log('Companies response:', data);
      
      // Handle the case where the API returns { data: [...companies], meta: {...} }
      const companiesArray = data.data || data;
      
      if (!Array.isArray(companiesArray)) {
        console.error('Companies data is not an array:', data);
        setCompanies([]);
        return;
      }
      
      // Normalize company data
      const normalizedCompanies = companiesArray.map((company: any) => ({
        ...company,
        id: company._id || company.id,
        logo: company.logoUrl || company.logo,
        // Support both owner and createdBy fields
        owner: {
          id: company.createdBy?._id || company.createdBy?.id || company.owner?.id || '',
          name: company.createdBy?.name || company.owner?.name || 'Unknown'
        }
      }));
      
      console.log('Normalized companies:', normalizedCompanies);
      setCompanies(normalizedCompanies);
    } catch (err) {
      setError('Error fetching companies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Use the public users endpoint temporarily
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users`, {
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      console.log('Users response:', data);
      
      // Handle the case where the API returns { data: [...users], meta: {...} }
      const usersArray = data.data || data.users || data;
      
      if (!Array.isArray(usersArray)) {
        console.error('Users data is not an array:', data);
        setUsers([]);
        return;
      }
      
      // Filter to only include employer users if possible
      const employerUsers = usersArray.filter((user: any) => 
        !user.role || user.role === 'employer' || user.role === 'admin'
      );
      
      // Normalize user data
      const normalizedUsers = employerUsers.map((user: any) => ({ 
        id: user._id || user.id, 
        name: user.name || 'Unknown User'
      }));
      
      setUsers(normalizedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      id: company.id,
      name: company.name,
      description: company.description,
      logoUrl: company.logo,
      ownerId: company.owner?.id
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedCompany(null);
    setFormData({
      name: '',
      description: '',
      logoUrl: '',
      ownerId: users[0]?.id
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleDelete = async (companyId: string) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete company');
      }
      
      setCompanies(companies.filter(company => company.id !== companyId));
      setError(null);
    } catch (err) {
      setError('Error deleting company. Please try again.');
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const companyData = {
      ...formData
    };
    
    try {
      if (isCreating) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/companies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storage.getToken()}`
          },
          body: JSON.stringify(companyData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create company');
        }
        
        const newCompany = await response.json();
        setCompanies([...companies, newCompany]);
      } else if (isEditing && selectedCompany) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/companies/${selectedCompany.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storage.getToken()}`
          },
          body: JSON.stringify(companyData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update company');
        }
        
        const updatedCompany = await response.json();
        setCompanies(companies.map(company => 
          company.id === updatedCompany.id ? updatedCompany : company
        ));
      }
      
      setIsEditing(false);
      setIsCreating(false);
      setSelectedCompany(null);
      setError(null);
    } catch (err) {
      setError('Error saving company data. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="companies-management">
      <div className="header">
        <h2>Companies Management</h2>
        <button className="create-btn" onClick={handleCreate}>Create New Company</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {(isEditing || isCreating) ? (
        <div className="company-form-container">
          <h3>{isCreating ? 'Create New Company' : 'Edit Company'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Company Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="logoUrl">Logo URL</label>
              <input 
                type="url" 
                id="logoUrl" 
                name="logoUrl" 
                value={formData.logoUrl || ''} 
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
              {formData.logoUrl && (
                <div className="logo-preview">
                  <img src={formData.logoUrl} alt="Logo preview" />
                </div>
              )}
            </div>
            
            {isCreating && (
              <div className="form-group">
                <label htmlFor="ownerId">Company Owner</label>
                <select 
                  id="ownerId" 
                  name="ownerId" 
                  value={formData.ownerId} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an owner</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="description">Company Description</label>
              <textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn">Save</button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                  setSelectedCompany(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="companies-table-container">
          {loading ? (
            <div className="loading">Loading companies...</div>
          ) : (
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length > 0 ? (
                  companies.map(company => (
                    <tr key={company.id}>
                      <td>
                        {company.logo ? (
                          <div className="company-logo-cell">
                            <img src={company.logo} alt={company.name} className="company-logo" />
                            <span>{company.name}</span>
                          </div>
                        ) : (
                          company.name
                        )}
                      </td>
                      <td>{company.owner?.name || '-'}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEdit(company)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(company.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>No companies found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default CompaniesManagement; 