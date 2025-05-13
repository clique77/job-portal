import { useState, useEffect, useRef, useCallback } from 'react';
import { CSSTransition } from 'react-transition-group';
import { JOB_TYPE_LABELS, JobsApi } from '../../../api/JobsApi';
import ApplicationApi, { ApplicationStatus } from '../../../api/ApplicationApi';
import CompanyApi from '../../../api/CompanyApi';
import JobApplication from '../JobApplication/JobApplication';
import JobApplicantsList from '../JobApplicantsList/JobApplicantsList';
import { useAuth } from '../../../hooks/useAuth';

import './JobDetails.scss';

export interface JobDetailsProps {
  jobId: string;
}

interface JobDetails {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number
    currency: string;
  };
  type: string;
  category: string;
  tags: string[];
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
  employer: string;
}

const JobDetails: React.FC<JobDetailsProps> = ({ jobId }) => {
  const [job, setJob] = useState<JobDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [showApplication, setShowApplication] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [companyName, setCompanyName] = useState<string>('');
  const [isJobOwner, setIsJobOwner] = useState<boolean>(false);
  
  // Refs to prevent infinite loops and excessive API calls
  const initialLoadDoneRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const nodeRef = useRef(null);
  const loadingJobRef = useRef<string | null>(null);
  
  const { user } = useAuth();

  // Reset on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Debounced job loading function
  const debouncedLoadJob = useCallback(() => {
    if (!jobId || !isMountedRef.current) return;
    
    // If already loading this job, don't trigger another load
    if (loadingJobRef.current === jobId) return;
    
    const currentTime = Date.now();
    // Enforce a minimum delay between job loading calls (debouncing)
    if (currentTime - lastFetchTimeRef.current > 300) {
      lastFetchTimeRef.current = currentTime;
      loadingJobRef.current = jobId;
      loadJobDetails();
    } else {
      // If we're clicking too fast, queue up this job load for later
      setTimeout(() => {
        if (isMountedRef.current && loadingJobRef.current !== jobId) {
          lastFetchTimeRef.current = Date.now();
          loadingJobRef.current = jobId;
          loadJobDetails();
        }
      }, 300);
    }
  }, [jobId]);

  // Reset on job ID change and trigger job loading
  useEffect(() => {
    if (jobId) {
      setShowApplication(false);
      initialLoadDoneRef.current = false;
      debouncedLoadJob();
    }
  }, [jobId, debouncedLoadJob]);

  const checkApplicationStatus = async () => {
    if (!jobId || !isMountedRef.current) return;
    
    try {
      const status = await ApplicationApi.checkApplication(jobId);
      
      if (!isMountedRef.current) return;
      
      if (!applicationStatus || 
          applicationStatus.hasApplied !== status?.hasApplied || 
          applicationStatus.status !== status?.status) {
        setApplicationStatus(status || { hasApplied: false, status: undefined });
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  // Main function to load job details
  const loadJobDetails = async () => {
    if (!jobId || !isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      
      const data = await JobsApi.getJobById(jobId);
      
      if (!isMountedRef.current) return;
      
      setJob(data.job);
      
      // Check if the current user is the job owner
      if (user && data.job.employer && user.id === data.job.employer) {
        setIsJobOwner(true);
      } else {
        setIsJobOwner(false);
      }
      
      if (data.job.company && data.job.company.length === 24 && /^[0-9a-fA-F]{24}$/.test(data.job.company)) {
        try {
          const company = await CompanyApi.getCompanyById(data.job.company);
          if (company && company.name) {
            setCompanyName(company.name);
          } else {
            setCompanyName(data.job.company);
          }
        } catch (error) {
          console.error('Error fetching company details:', error);
          setCompanyName(data.job.company);
        }
      } else {
        setCompanyName(data.job.company);
      }
      
      // Only check application status on initial load
      if (!initialLoadDoneRef.current) {
        await checkApplicationStatus();
        initialLoadDoneRef.current = true;
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to fetch job details...');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        loadingJobRef.current = null;
      }
    }
  };

  // Helper functions
  const getStatusClassName = (status?: string) => {
    if (!status) return '';
    return status.toLowerCase().replace('_', '-');
  };

  const formatSalary = (salary: JobDetails['salary']) => {
    if (!salary) {
      return 'Salary not specified';
    }

    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  }

  const formatJobType = (type: string) => {
    return JOB_TYPE_LABELS[type as keyof typeof JOB_TYPE_LABELS] || type;
  }

  // Component rendering
  if (isLoading) {
    return <div className="job-details__loading">Loading...</div>
  }

  if (error) {
    return <div className="job-details__error">{error}</div>
  }

  if (!job) {
    return <div className="job-details__not-found">Job not found</div>
  }

  return (
    <div className="job-details">
      <header className="job-details__header">
        <h1 className="job-details__title">{job.title || 'No Title'}</h1>
        <div className="job-details__company">{companyName || 'Company not specified'}</div>
        <div className="job-details__location">{job.location || 'Location not specified'}</div>
      </header>

      <section className="job-details__main">
        <div className="job-details__salary">
          <h3>Salary Range</h3>
          <p>
            {job.salary 
              ? formatSalary(job.salary)
              : 'Salary not specified'
            }
          </p>
        </div>

        <div className="job-details__type">
          <h3>Job Type</h3>
          <p>{formatJobType(job.type) || 'Not specified'}</p>
        </div>

        <div className="job-details__description">
          <h3>Description</h3>
          <p>{job.description || 'No description available'}</p>
        </div>

        <div className="job-details__requirements">
          <h3>Requirements</h3>
          <p>{job.requirements || 'No requirements specified'}</p>
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="job-details__tags">
            <h3>Skills</h3>
            <div className="job-details__tags-list">
              {job.tags.map((tag, index) => (
                <span key={index} className="job-details__tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {(isJobOwner || window.location.pathname.includes('/employer/jobs/')) && (
        <section className="job-details__applicants">
          <JobApplicantsList jobId={jobId} />
        </section>
      )}

      {job.status === 'ACTIVE' && !isJobOwner && !window.location.pathname.includes('/employer/jobs/') && (
        <div className="job-details__actions">
          {!applicationStatus?.hasApplied ? (
            <>
              <CSSTransition
                in={showApplication}
                timeout={300}
                classNames="job-application"
                unmountOnExit
                nodeRef={nodeRef}
              >
                <div ref={nodeRef}>
                  <JobApplication
                    jobId={job._id}
                    jobTitle={job.title}
                    company={companyName}
                    onSuccess={() => {
                      setShowApplication(false);
                      setApplicationStatus({ hasApplied: true, status: 'PENDING' });
                    }}
                    onCancel={() => setShowApplication(false)}
                  />
                </div>
              </CSSTransition>
              
              <div className="job-application-container">
                {!showApplication && (
                  <button 
                    className="job-details__apply-btn"
                    onClick={() => setShowApplication(true)}
                  >
                    Quick Apply
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="job-details__application-status">
              <p>You have already applied for this job</p>
              {applicationStatus.status && (
                <p>
                  Status: <span className={`status ${getStatusClassName(applicationStatus.status)}`}>
                    {applicationStatus.status === 'PENDING' && '⏳ '}
                    {applicationStatus.status === 'ACCEPTED' && '✅ '}
                    {applicationStatus.status === 'REJECTED' && '❌ '}
                    {applicationStatus.status === 'WITHDRAWN' && '↩️ '}
                    {applicationStatus.status === 'REVIEWING' && '🔎 '}
                    {applicationStatus.status}
                  </span>
                </p>
              )}
              {applicationStatus.status === 'PENDING' && (
                <p className="status-message">
                  Your application is being reviewed by the employer. You'll be notified when there's an update.
                </p>
              )}
              {applicationStatus.status === 'ACCEPTED' && (
                <p className="status-message">
                  Congratulations! The employer has accepted your application.
                </p>
              )}
              {applicationStatus.status === 'REJECTED' && (
                <p className="status-message">
                  Unfortunately, the employer has decided not to proceed with your application at this time.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetails; 