import { useState } from 'react';
import { JobsApi, Job, JobUpdateData, JOB_CATEGORIES, JOB_TYPE_LABELS } from '../../../api/JobsApi';
import './EditJobForm.scss';

interface EditJobFormProps {
  job: Job;
  onSubmit: (job: Job) => void;
  onCancel: () => void;
}

const EditJobForm: React.FC<EditJobFormProps> = ({ 
  job,
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<JobUpdateData>({
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    salary: { ...job.salary },
    type: job.type,
    category: job.category,
    tags: [...job.tags],
    status: job.status,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.title?.trim()) {
      errors.title = 'Job title is required';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }
    
    if (!formData.requirements?.trim()) {
      errors.requirements = 'Requirements are required';
    } else if (formData.requirements.trim().length < 10) {
      errors.requirements = 'Requirements must be at least 10 characters long';
    }
    
    if (!formData.location?.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!formData.category?.trim()) {
      errors.category = 'Category is required';
    }
    
    if (formData.salary && formData.salary.min <= 0) {
      errors.salaryMin = 'Minimum salary must be greater than 0';
    }
    
    if (formData.salary && formData.salary.max <= 0) {
      errors.salaryMax = 'Maximum salary must be greater than 0';
    }
    
    if (formData.salary && formData.salary.max < formData.salary.min) {
      errors.salaryMax = 'Maximum salary must be greater than or equal to minimum salary';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('salary.')) {
      const salaryField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary!,
          [salaryField]: salaryField === 'currency' ? value : Number(value)
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const updatedJob = await JobsApi.updateJob(job._id, formData);
      onSubmit(updatedJob);
    } catch (err) {
      setError('An error occurred while updating the job.');
      console.error('Update job error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-job-form">
      <h2>Edit Job</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className={`form-group ${validationErrors.title ? 'has-error' : ''}`}>
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Frontend Developer"
              disabled={isLoading}
            />
            {validationErrors.title && <div className="error-text">{validationErrors.title}</div>}
          </div>

          <div className={`form-group ${validationErrors.location ? 'has-error' : ''}`}>
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. Kyiv, Ukraine"
              disabled={isLoading}
            />
            {validationErrors.location && <div className="error-text">{validationErrors.location}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className={`form-group ${validationErrors.type ? 'has-error' : ''}`}>
            <label htmlFor="type">Job Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className={`form-group ${validationErrors.category ? 'has-error' : ''}`}>
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="">Select a category</option>
              {JOB_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {validationErrors.category && <div className="error-text">{validationErrors.category}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className={`form-group ${validationErrors.salaryMin ? 'has-error' : ''}`}>
            <label htmlFor="salary.min">Minimum Salary *</label>
            <input
              type="number"
              id="salary.min"
              name="salary.min"
              value={formData.salary?.min}
              onChange={handleChange}
              required
              min="0"
              disabled={isLoading}
            />
            {validationErrors.salaryMin && <div className="error-text">{validationErrors.salaryMin}</div>}
          </div>

          <div className={`form-group ${validationErrors.salaryMax ? 'has-error' : ''}`}>
            <label htmlFor="salary.max">Maximum Salary *</label>
            <input
              type="number"
              id="salary.max"
              name="salary.max"
              value={formData.salary?.max}
              onChange={handleChange}
              required
              min="0"
              disabled={isLoading}
            />
            {validationErrors.salaryMax && <div className="error-text">{validationErrors.salaryMax}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="salary.currency">Currency</label>
            <select
              id="salary.currency"
              name="salary.currency"
              value={formData.salary?.currency}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="UAH">UAH</option>
              <option value="PLN">PLN</option>
            </select>
          </div>
        </div>

        <div className={`form-group ${validationErrors.description ? 'has-error' : ''}`}>
          <label htmlFor="description">Job Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the job role and responsibilities"
            rows={5}
            disabled={isLoading}
          />
          {validationErrors.description && <div className="error-text">{validationErrors.description}</div>}
        </div>

        <div className={`form-group ${validationErrors.requirements ? 'has-error' : ''}`}>
          <label htmlFor="requirements">Requirements *</label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            required
            placeholder="List the requirements for this position"
            rows={5}
            disabled={isLoading}
          />
          {validationErrors.requirements && <div className="error-text">{validationErrors.requirements}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (Press Enter to add)</label>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="e.g. react, javascript, remote"
            disabled={isLoading}
          />
          
          {formData.tags && formData.tags.length > 0 && (
            <div className="tags-container">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
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
            {isLoading ? 'Updating...' : 'Update Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobForm; 