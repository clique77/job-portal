import { useState, useEffect } from 'react';
import { storage } from '../../../api/UserApi';
import './JobsManagement.scss';

interface Job {
  id: string;
  _id?: string;
  title: string;
  description: string;
  company?: {
    id: string;
    name: string;
  };
  location: string;
  employmentType: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'active' | 'closed' | 'draft';
  postedDate?: string;
}

interface JobFormData {
  id?: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  status: 'active' | 'closed' | 'draft';
}

interface Company {
  id: string;
  _id?: string;
  name: string;
}

const JobsManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [_companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form state
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    location: '',
    employmentType: 'full-time',
    status: 'active'
  });

  // Fetch jobs data - use the public endpoint temporarily
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the public jobs endpoint instead of admin endpoint for now
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/jobs`, {
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      console.log('Jobs response:', data);
      
      // Normalize job data to ensure id is available
      // Handle the case where the API returns { data: [...jobs], meta: {...} }
      const jobsArray = data.data || data;
      
      if (!Array.isArray(jobsArray)) {
        console.error('Jobs data is not an array:', data);
        setJobs([]);
        return;
      }
      
      const normalizedJobs = jobsArray.map((job: any) => ({
        ...job,
        id: job._id || job.id,
        company: job.company ? {
          ...job.company,
          id: job.company?._id || job.company?.id || ''
        } : undefined
      }));
      
      setJobs(normalizedJobs);
    } catch (err) {
      setError('Error fetching jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies for the dropdown - use regular endpoint for now
  const fetchCompanies = async () => {
    try {
      // Use the public companies endpoint instead
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/companies`, {
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      
      const data = await response.json();
      console.log('Companies response:', data);
      
      // Check if data is an array or has data property
      const companiesArray = data.data || data;
      
      if (!Array.isArray(companiesArray)) {
        console.error('Companies data is not an array:', data);
        setCompanies([]);
        return;
      }
      
      // Normalize company data
      const normalizedCompanies = companiesArray.map((company: any) => ({ 
        id: company._id || company.id || '', 
        name: company.name || 'Unknown Company'
      }));
      
      setCompanies(normalizedCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
      // Set empty array to avoid map errors
      setCompanies([]);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const handleEdit = (job: Job) => {
    const jobId = job.id || job._id;
    if (!jobId) {
      setError('Cannot edit job without a valid ID');
      return;
    }
    
    setSelectedJob(job);
    setFormData({
      id: jobId as string,
      title: job.title,
      description: job.description,
      location: job.location,
      employmentType: job.employmentType,
      salaryMin: job.salary?.min,
      salaryMax: job.salary?.max,
      salaryCurrency: job.salary?.currency,
      status: job.status
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedJob(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      employmentType: 'full-time',
      status: 'active'
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleDelete = async (jobId: string) => {
    if (!jobId) {
      setError('Cannot delete job without a valid ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      setJobs(jobs.filter(job => (job.id || job._id) !== jobId));
      setError(null);
    } catch (err) {
      setError('Error deleting job. Please try again.');
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
    
    // Transform form data to match API expectations
    const jobData = {
      ...formData,
      salary: (formData.salaryMin || formData.salaryMax) ? {
        min: formData.salaryMin || 0,
        max: formData.salaryMax || 0,
        currency: formData.salaryCurrency || 'USD'
      } : undefined
    };
    
    try {
      if (isCreating) {
        // Use the admin job creation endpoint
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storage.getToken()}`
          },
          body: JSON.stringify(jobData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create job');
        }
        
        const newJob = await response.json();
        const normalizedJob = {
          ...newJob,
          id: newJob._id || newJob.id
        };
        
        setJobs([...jobs, normalizedJob]);
      } else if (isEditing && selectedJob) {
        const jobId = selectedJob.id || selectedJob._id;
        
        if (!jobId) {
          throw new Error('Cannot update job without a valid ID');
        }
        
        // Use the admin job update endpoint
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/jobs/${jobId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storage.getToken()}`
          },
          body: JSON.stringify(jobData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update job');
        }
        
        const updatedJob = await response.json();
        const normalizedJob = {
          ...updatedJob,
          id: updatedJob._id || updatedJob.id
        };
        
        setJobs(jobs.map(job => 
          (job.id || job._id) === (normalizedJob.id || normalizedJob._id) ? normalizedJob : job
        ));
      }
      
      setIsEditing(false);
      setIsCreating(false);
      setSelectedJob(null);
      setError(null);
    } catch (err) {
      setError('Error saving job data. Please try again.');
      console.error(err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="jobs-management">
      <div className="header">
        <h2>Jobs Management</h2>
        <button className="create-btn" onClick={handleCreate}>Create New Job</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {(isEditing || isCreating) ? (
        <div className="job-form-container">
          <h3>{isCreating ? 'Create New Job' : 'Edit Job'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Job Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input 
                type="text" 
                id="location" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="employmentType">Employment Type</label>
              <select 
                id="employmentType" 
                name="employmentType" 
                value={formData.employmentType} 
                onChange={handleChange}
                required
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salaryMin">Salary Min</label>
                <input 
                  type="number" 
                  id="salaryMin" 
                  name="salaryMin" 
                  value={formData.salaryMin || ''} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="salaryMax">Salary Max</label>
                <input 
                  type="number" 
                  id="salaryMax" 
                  name="salaryMax" 
                  value={formData.salaryMax || ''} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="salaryCurrency">Currency</label>
                <select 
                  id="salaryCurrency" 
                  name="salaryCurrency" 
                  value={formData.salaryCurrency || 'USD'} 
                  onChange={handleChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="UAH">UAH</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select 
                id="status" 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                required
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Job Description</label>
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
                  setSelectedJob(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="jobs-table-container">
          {loading ? (
            <div className="loading">Loading jobs...</div>
          ) : (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Posted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length > 0 ? (
                  jobs.map(job => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.location}</td>
                      <td>{job.employmentType}</td>
                      <td>{formatDate(job.postedDate)}</td>
                      <td>
                        <span className={`status-badge status-${job.status}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEdit(job)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete((job.id || job._id) as string)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No jobs found</td>
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

export default JobsManagement; 