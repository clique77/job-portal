import React, { useState, useEffect } from 'react';
import { Job, JobsApi, JOB_TYPE_LABELS } from '../../../api/JobsApi';
import CompanyApi from '../../../api/CompanyApi';
import './JobCard.scss';

interface JobCardProps {
  job: Job;
  onJobClick?: (jobId: string) => void;
  onUnsave?: () => void;
  isSaved?: boolean;
  isUnsaving?: boolean;
  isSelected?: boolean;
  singleColumn?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onJobClick, 
  onUnsave, 
  isSaved: initialIsSaved,
  isUnsaving = false,
  isSelected = false,
  singleColumn = false
}) => {
  if (!job || !job._id || !job.title) {
    console.error('Invalid job object received by JobCard:', job);
    return (
      <div className="job-card error">
        <p>Invalid job data</p>
      </div>
    );
  }

  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [companyName, setCompanyName] = useState<string>(job.company || 'Unknown Company');

  useEffect(() => {
    if (initialIsSaved === undefined) {
      const checkIfSaved = async () => {
        try {
          const saved = await JobsApi.isJobSaved(job._id);
          setIsSaved(saved);
          setIsLoggedIn(true);
        } catch (error) {
          setIsLoggedIn(false);
        }
      };
      checkIfSaved();
    }
  }, [job._id, initialIsSaved]);

  useEffect(() => {
    if (job.company && job.company.length === 24 && /^[0-9a-fA-F]{24}$/.test(job.company)) {
      const fetchCompanyName = async () => {
        try {
          const company = await CompanyApi.getCompanyById(job.company);
          if (company && company.name) {
            setCompanyName(company.name);
          }
        } catch (error) {
          console.error('Error fetching company details:', error);
        }
      };
      fetchCompanyName();
    }
  }, [job.company]);

  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatJobType = (type: string) => {
    if (!type) return 'Not specified';
    return JOB_TYPE_LABELS[type as keyof typeof JOB_TYPE_LABELS] || type;
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((isLoading || isUnsaving) || !isLoggedIn) {
      if (!isLoggedIn) {
        alert('Please log in to save jobs');
      }
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        await JobsApi.unsaveJob(job._id);
        onUnsave?.();
        setIsSaved(false);
      } else {
        await JobsApi.saveJob(job._id);
        setIsSaved(true);
      }
      setIsLoggedIn(true);
    } catch (error) {
      if ((error as Error).message === 'Authentication required') {
        setIsLoggedIn(false);
        alert('Please log in to save jobs');
      } else {
        console.error('Error toggling job save state:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isLoadingState = isLoading || isUnsaving;

  // Tag logic
  const MAX_TAGS_GRID = 3;
  let visibleTags = job.tags;
  let hiddenCount = 0;
  if (!singleColumn && Array.isArray(job.tags) && job.tags.length > MAX_TAGS_GRID) {
    visibleTags = job.tags.slice(0, MAX_TAGS_GRID);
    hiddenCount = job.tags.length - MAX_TAGS_GRID;
  }

  return (
    <div 
      className={`job-card ${isSaved ? 'saved' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => onJobClick?.(job._id)}
    >
      <div className="job-card-header">
        <h3 className="job-title">{job.title}</h3>
        <button 
          className={`save-button ${isSaved ? 'saved' : ''} ${isLoadingState ? 'loading' : ''} ${!isLoggedIn ? 'disabled' : ''}`}
          onClick={handleSaveToggle}
          disabled={isLoadingState || !isLoggedIn}
          title={!isLoggedIn ? 'Please log in to save jobs' : (isSaved ? 'Unsave job' : 'Save job')}
        >
          {isLoadingState ? (
            <span className="loading-indicator"></span>
          ) : (
            isSaved ? '★' : '☆'
          )}
        </button>
      </div>
      <p className="job-company">{companyName}</p>
      <p className="job-location">{job.location || 'Location not specified'}</p>
      <p className="job-type">{formatJobType(job.type)}</p>
      {job.salary && job.salary.min && job.salary.max && job.salary.currency && (
        <p className="job-salary">
          {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
        </p>
      )}
      <div className="job-tags">
        {Array.isArray(visibleTags) && visibleTags.map((tag, index) => (
          <span key={index} className="job-tag">{tag}</span>
        ))}
        {!singleColumn && hiddenCount > 0 && (
          <span className="job-tag job-tag-ellipsis">+{hiddenCount} more</span>
        )}
      </div>
    </div>
  );
};

export default JobCard;