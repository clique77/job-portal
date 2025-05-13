import { useState, useEffect } from 'react';
import CompanyApi, { Company, CompanyUpdateData } from '../../../api/CompanyApi';
import './EditCompanyForm.scss';

interface EditCompanyFormProps {
  companyId: string;
  onSubmit: (company: Company) => void;
  onCancel: () => void;
}

const EditCompanyForm: React.FC<EditCompanyFormProps> = ({ 
  companyId,
  onSubmit, 
  onCancel
}) => {
  const [formData, setFormData] = useState<CompanyUpdateData>({
    name: '',
    description: '',
    logoUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoadingCompany(true);
      try {
        const company = await CompanyApi.getCompanyById(companyId);
        console.log('Fetched company for editing:', company); // Debug log
        if (company) {
          setFormData({
            name: company.name,
            description: company.description,
            logoUrl: company.logoUrl
          });
        } else {
          setError('Could not find company details');
        }
      } catch (err) {
        setError('Error loading company details');
        console.error('Error fetching company:', err);
      } finally {
        setIsLoadingCompany(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Company name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Company name must be at least 2 characters';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    // Logo URL is optional, but if provided should be a valid URL
    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      errors.logoUrl = 'Please enter a valid URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Empty is considered valid as it's optional
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        logoUrl: formData.logoUrl || ''
      };
      
      console.log('Updating company with data:', updateData);
      
      // First try the direct update method
      const success = await CompanyApi.directCompanyUpdate(companyId, updateData);
      
      if (success) {
        console.log('Direct update successful');
        
        // Fetch the updated company to get the latest data
        const updatedCompany = await CompanyApi.getCompanyById(companyId);
        
        if (updatedCompany) {
          console.log('Updated company fetched successfully:', updatedCompany);
          onSubmit(updatedCompany);
        } else {
          // If we can't fetch the updated company, create a temporary one with our form data
          console.log('Could not fetch updated company, using form data');
          onSubmit({
            _id: companyId,
            id: companyId,
            name: updateData.name || '',
            description: updateData.description || '',
            logoUrl: updateData.logoUrl || '',
            createdBy: '',
            createdAt: '',
            updatedAt: ''
          });
        }
      } else {
        // Fall back to the regular update method
        console.log('Direct update failed, trying regular update method');
        const company = await CompanyApi.updateCompany(companyId, updateData);
        
        if (company) {
          console.log('Company updated successfully with regular method:', company);
          onSubmit(company);
        } else {
          setError('Failed to update company. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred while updating the company.');
      console.error('Update company error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCompany) {
    return <div className="loading-spinner">Loading company details...</div>;
  }

  return (
    <div className="edit-company-form">
      <h2>Edit Company</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={`form-group ${validationErrors.name ? 'has-error' : ''}`}>
          <label htmlFor="name">Company Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            placeholder="Enter company name"
            disabled={isLoading}
          />
          {validationErrors.name && <div className="error-text">{validationErrors.name}</div>}
        </div>

        <div className={`form-group ${validationErrors.description ? 'has-error' : ''}`}>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            required
            placeholder="Describe your company"
            rows={5}
            disabled={isLoading}
          />
          {validationErrors.description && <div className="error-text">{validationErrors.description}</div>}
        </div>

        <div className={`form-group ${validationErrors.logoUrl ? 'has-error' : ''}`}>
          <label htmlFor="logoUrl">Logo URL (optional)</label>
          <input
            type="url"
            id="logoUrl"
            name="logoUrl"
            value={formData.logoUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            disabled={isLoading}
          />
          {validationErrors.logoUrl && <div className="error-text">{validationErrors.logoUrl}</div>}
          {formData.logoUrl && (
            <div className="logo-preview">
              <img 
                src={formData.logoUrl} 
                alt="Company logo preview" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  setValidationErrors(prev => ({ 
                    ...prev, 
                    logoUrl: 'Unable to load image from URL' 
                  }));
                }}
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.display = 'block';
                  if (validationErrors.logoUrl === 'Unable to load image from URL') {
                    setValidationErrors(prev => {
                      const newErrors = {...prev};
                      delete newErrors.logoUrl;
                      return newErrors;
                    });
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Company'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCompanyForm; 