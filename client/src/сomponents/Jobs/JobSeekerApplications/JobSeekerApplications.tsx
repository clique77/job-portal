import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ApplicationApi from '../../../api/ApplicationApi';
import ApplicationJobDetail from './ApplicationJobDetail';
import './JobSeekerApplications.scss';

interface Application {
  job: {
    _id: string;
    title: string;
    company: string;
    location?: string;
    type?: string;
  };
  application: {
    status: string;
    appliedAt: string;
    notes?: string;
    resumeId?: string;
  };
}

const ApplicationCard: React.FC<{
  application: Application;
  onClick: (jobId: string) => void;
  isSelected: boolean;
}> = ({ application, onClick, isSelected }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'ACCEPTED':
      case 'APPROVED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      case 'REVIEWING':
        return 'status-reviewing';
      case 'WITHDRAWN':
        return 'status-withdrawn';
      default:
        return 'status-default';
    }
  };

  return (
    <div 
      className={`application-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(application.job._id)}
    >
      <h3 className="job-title">{application.job.title}</h3>
      <p className="company-name">{application.job.company}</p>
      {application.job.location && (
        <p className="job-location">{application.job.location}</p>
      )}
      <div className="application-info">
        <span className={`application-status ${getStatusColor(application.application.status)}`}>
          {application.application.status}
        </span>
        <span className="application-date">
          Applied on {formatDate(application.application.appliedAt)}
        </span>
      </div>
    </div>
  );
};

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [jobToWithdraw, setJobToWithdraw] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const lastNavigationTimeRef = useRef<number>(0);
  const navigate = useNavigate();
  const { jobId } = useParams();

  useEffect(() => {
    if (jobId) {
      setSelectedJob(jobId);
    }
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await ApplicationApi.getUserApplications();
      
      if (result && Array.isArray(result)) {
        const sortedApplications = [...result].sort((a, b) => 
          new Date(b.application.appliedAt).getTime() - new Date(a.application.appliedAt).getTime()
        );
        setApplications(sortedApplications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      if ((err as Error).message === 'You are not authorized to access this resource') {
        setError('Please log in to view your applications');
      } else {
        setError('Failed to fetch your applications. Please try again later.');
        console.error('Error fetching applications:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleJobClick = (jobId: string) => {
    if (isNavigating || selectedJob === jobId) return;
    
    const currentTime = Date.now();
    if (currentTime - lastNavigationTimeRef.current < 300) {
      return;
    }
    
    lastNavigationTimeRef.current = currentTime;
    setIsNavigating(true);
    setSelectedJob(jobId);
    navigate(`/my-applications/${jobId}`, { replace: true });
    
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  };

  const handleWithdrawClick = (jobId: string) => {
    setJobToWithdraw(jobId);
    setShowConfirmation(true);
  };

  const confirmWithdraw = async () => {
    if (!jobToWithdraw) return;
    
    try {
      setWithdrawError(null);
      await ApplicationApi.withdrawApplication(jobToWithdraw);
      
      fetchApplications();
      
      if (selectedJob === jobToWithdraw) {
        setSelectedJob(null);
        navigate('/my-applications', { replace: true });
      }

      setShowConfirmation(false);
      setJobToWithdraw(null);
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setWithdrawError(err instanceof Error ? err.message : 'Failed to withdraw application. Please try again.');
    }
  };

  const cancelWithdraw = () => {
    setShowConfirmation(false);
    setJobToWithdraw(null);
    setWithdrawError(null);
  };

  if (isLoading) {
    return (
      <div className="my-applications-loading">
        <div className="spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-applications-error">
        <p>{error}</p>
        {error.includes('log in') ? (
          <button onClick={() => navigate('/login')} className="login-button">
            Log In
          </button>
        ) : (
          <button onClick={fetchApplications} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`my-applications-container ${selectedJob ? 'with-details' : ''}`}>
      <div className="applications-section">
        <h1>My Applications</h1>
        
        {applications.length === 0 ? (
          <div className="no-applications">
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="browse-jobs-link">Browse Jobs</Link>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map(application => (
              <ApplicationCard
                key={application.job._id}
                application={application}
                onClick={handleJobClick}
                isSelected={selectedJob === application.job._id}
              />
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <div className="job-details-section">
          <ApplicationJobDetail 
            jobId={selectedJob}
            isPending={applications.find(app => app.job._id === selectedJob)?.application.status.toUpperCase() === 'PENDING'}
            onWithdraw={() => handleWithdrawClick(selectedJob)}
          />
        </div>
      )}

      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Withdraw Application</h3>
            <p>Are you sure you want to withdraw your application? This action cannot be undone.</p>
            
            {withdrawError && (
              <div className="error-message">
                {withdrawError}
              </div>
            )}
            
            <div className="confirmation-actions">
              <button 
                className="cancel-btn" 
                onClick={cancelWithdraw}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={confirmWithdraw}
              >
                Yes, Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications; 