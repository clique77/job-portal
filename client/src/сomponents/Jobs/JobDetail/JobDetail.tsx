import { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { JOB_TYPE_LABELS, JobsApi } from '../../../api/JobsApi';
import ApplicationApi, { ApplicationStatus } from '../../../api/ApplicationApi';
import JobApplication from '../JobApplication/JobApplication';

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
  const nodeRef = useRef(null);

  useEffect(() => {
    setShowApplication(false);
  }, [jobId]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        const data = await JobsApi.getJobById(jobId as string);
        setJob(data.job);
        await checkApplicationStatus();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch job details...');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const checkApplicationStatus = async () => {
    if (jobId) {
      try {
        const status = await ApplicationApi.checkApplication(jobId);
        setApplicationStatus(status || { hasApplied: false, status: undefined });
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    }
  };

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
        <div className="job-details__company">{job.company || 'Company not specified'}</div>
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

      {job.status === 'ACTIVE' && (
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
                    company={job.company}
                    onSuccess={() => {
                      setShowApplication(false);
                      checkApplicationStatus();
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
                    {applicationStatus.status}
                  </span>
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