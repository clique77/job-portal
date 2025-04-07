import React, { useEffect, useState } from 'react';
import { Job, JobsApi } from '../../../api/JobsApi';
import JobCard from '../JobCard/JobCard';
import JobDetails from '../JobDetail/JobDetail';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './SavedJobs.scss';

const SavedJobs: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isUnsaving, setIsUnsaving] = useState<string | null>(null);
  const navigate = useNavigate();
  const { jobId } = useParams();

  useEffect(() => {
    if (jobId) {
      setSelectedJob(jobId);
    }
  }, [jobId]);

  const fetchSavedJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const jobs = await JobsApi.getSavedJobs();
      setSavedJobs(jobs);
    } catch (err) {
      if ((err as Error).message === 'You are not authorized to access this resource') {
        setError('Please log in to view your saved jobs');
      } else {
        setError('Failed to fetch saved jobs. Please try again later.');
        console.error('Error fetching saved jobs:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleUnsaveJob = async (jobId: string) => {
    try {
      setIsUnsaving(jobId);
      await JobsApi.unsaveJob(jobId);
      setSavedJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      
      if (selectedJob === jobId) {
        setSelectedJob(null);
        navigate('/saved-jobs', { replace: true });
      }
    } catch (err) {
      if ((err as Error).message === 'You are not authorized to access this resource') {
        setError('Please log in to manage your saved jobs');
      } else {
        console.error('Error unsaving job:', err);
      }
    } finally {
      setIsUnsaving(null);
    }
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJob(jobId);
    navigate(`/saved-jobs/${jobId}`, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="saved-jobs-loading">
        <div className="spinner"></div>
        <p>Loading saved jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-jobs-error">
        <p>{error}</p>
        {error.includes('log in') ? (
          <button onClick={() => navigate('/login')} className="login-button">
            Log In
          </button>
        ) : (
          <button onClick={fetchSavedJobs} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`saved-jobs-container ${selectedJob ? 'with-details' : ''}`}>
      <div className="jobs-section">
        <h1>Saved Jobs</h1>
        {savedJobs.length === 0 ? (
          <div className="no-saved-jobs">
            <p>You haven't saved any jobs yet.</p>
            <Link to="/" className="browse-jobs-link">Browse Jobs</Link>
          </div>
        ) : (
          <div className="saved-jobs-grid">
            {savedJobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                onJobClick={handleJobClick}
                onUnsave={() => handleUnsaveJob(job._id)}
                isSaved={true}
                isUnsaving={isUnsaving === job._id}
                isSelected={selectedJob === job._id}
              />
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <div className="job-details-section">
          <JobDetails jobId={selectedJob} />
        </div>
      )}
    </div>
  );
};

export default SavedJobs; 