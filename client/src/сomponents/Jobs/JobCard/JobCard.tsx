import React, { useState, useEffect } from 'react';
import { Job, JobsApi, JOB_TYPE_LABELS } from '../../../api/JobsApi';
import './JobCard.scss';

interface JobCardProps {
  job: Job;
  onJobClick?: (jobId: string) => void;
  onUnsave?: () => void;
  isSaved?: boolean;
  isUnsaving?: boolean;
  isSelected?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onJobClick, 
  onUnsave, 
  isSaved: initialIsSaved,
  isUnsaving = false,
  isSelected = false
}) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    if (initialIsSaved === undefined) {
      const checkIfSaved = async () => {
        try {
          const saved = await JobsApi.isJobSaved(job._id);
          setIsSaved(saved);
          setIsLoggedIn(true);
        } catch (error) {
          if ((error as Error).message === 'You are not authorized to access this resource') {
            setIsLoggedIn(false);
          } else {
            console.error('Error checking if job is saved:', error);
          }
        }
      };
      checkIfSaved();
    }
  }, [job._id, initialIsSaved]);

  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatJobType = (type: string) => {
    return JOB_TYPE_LABELS[type as keyof typeof JOB_TYPE_LABELS] || type;
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((isLoading || isUnsaving) || !isLoggedIn) return;

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
      if ((error as Error).message === 'You are not authorized to access this resource') {
        setIsLoggedIn(false);
      } else {
        console.error('Error toggling job save state:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isLoadingState = isLoading || isUnsaving;

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
      <p className="job-company">{job.company}</p>
      <p className="job-location">{job.location}</p>
      <p className="job-type">{formatJobType(job.type)}</p>
      {job.salary && (
        <p className="job-salary">
          {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
        </p>
      )}
      <div className="job-tags">
        {job.tags.map((tag, index) => (
          <span key={index} className="job-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default JobCard;