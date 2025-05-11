import { useState } from 'react';
import CompanyApi, { Company, CompanyCreateData } from '../../../api/CompanyApi';
import './CreateCompanyForm.scss';

interface CreateCompanyFormProps {
  onSubmit: (company: Company) => void;
  onCancel: () => void;
  initialData?: Partial<CompanyCreateData>;
}

const CreateCompanyForm: React.FC<CreateCompanyFormProps> = ({ 
  onSubmit, 
  onCancel,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<CompanyCreateData>({
    name: initialData.name || '',
    description: initialData.description || '',
    logoUrl: initialData.logoUrl || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Company name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Company name must be at least 2 characters';
    }
    
    if (!formData.description.trim()) {
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
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating company with data:', formData); // Debug log
      const company = await CompanyApi.createCompany(formData);
      console.log('API response for company creation:', company); // Debug log
      
      if (company) {
        // Add a small delay before submitting to ensure data is processed
        setTimeout(() => {
          onSubmit(company);
          console.log('Company created and submitted to parent component:', company);
        }, 300);
      } else {
        setError('Failed to create company. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while creating the company.');
      console.error('Create company error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-company-form">
      <h2>Create New Company</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={`form-group ${validationErrors.name ? 'has-error' : ''}`}>
          <label htmlFor="name">Company Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
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
            value={formData.description}
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
            value={formData.logoUrl}
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
            {isLoading ? 'Creating...' : 'Create Company'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompanyForm; 