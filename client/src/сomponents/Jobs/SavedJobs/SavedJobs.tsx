import React, { useEffect, useState, useRef } from 'react';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const lastNavigationTimeRef = useRef<number>(0);
  const limit = 8; // Number of jobs per page
  const navigate = useNavigate();
  const { jobId } = useParams();

  useEffect(() => {
    if (jobId) {
      setSelectedJob(jobId);
    }
  }, [jobId]);

  const fetchSavedJobs = async (currentPage = page) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await JobsApi.getSavedJobs(currentPage, limit);
      
      // Filter out any null jobs or jobs with missing required fields
      const validJobs = result.jobs.filter(job => 
        job && job._id && job.title && job.company
      );
      
      if (validJobs.length !== result.jobs.length) {
        console.warn(`Filtered out ${result.jobs.length - validJobs.length} invalid job entries`);
      }
      
      setSavedJobs(validJobs);
      setTotalPages(result.pages);
      setTotalJobs(result.total);
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
  }, [page]);

  const handleUnsaveJob = async (jobId: string) => {
    try {
      setIsUnsaving(jobId);
      await JobsApi.unsaveJob(jobId);
      setSavedJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      setTotalJobs(prev => prev - 1);
      
      // If we've removed the last job on a page, go back one page (unless we're on page 1)
      if (savedJobs.length === 1 && page > 1) {
        setPage(prevPage => prevPage - 1);
      } else {
        // Otherwise just refresh current page
        fetchSavedJobs();
      }
      
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
    // Prevent rapid clicking from causing navigation issues
    if (isNavigating || selectedJob === jobId) return;
    
    const currentTime = Date.now();
    // Add debounce to avoid multiple rapid navigation attempts
    if (currentTime - lastNavigationTimeRef.current < 300) {
      return;
    }
    
    lastNavigationTimeRef.current = currentTime;
    setIsNavigating(true);
    setSelectedJob(jobId);
    navigate(`/saved-jobs/${jobId}`, { replace: true });
    
    // Reset navigation lock after a short delay
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Reset selected job when changing pages
    setSelectedJob(null);
    navigate('/saved-jobs', { replace: true });
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
          <button onClick={() => fetchSavedJobs(1)} className="retry-button">
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
        {totalJobs === 0 ? (
          <div className="no-saved-jobs">
            <p>You haven't saved any jobs yet.</p>
            <Link to="/" className="browse-jobs-link">Browse Jobs</Link>
          </div>
        ) : (
          <>
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
            
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
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