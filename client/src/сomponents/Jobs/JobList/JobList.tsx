import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, JobsApi, JOB_LOCATIONS, JOB_TYPE_LABELS } from "../../../api/JobsApi";
import JobDetails from '../JobDetail/JobDetail';
import JobCard from '../JobCard/JobCard';
import './JobList.scss';

const JobList: React.FC = () => {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    search: ''
  });
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await JobsApi.getJobs(1, 100, {});
        const jobs = response.data || [];
        setAllJobs(jobs);
        setFilteredJobs(jobs);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch jobs');
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const filtered = allJobs.filter(job => {
      const searchMatch = !filters.search || 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));

      const locationMatch = !filters.location || job.location === filters.location;
      const typeMatch = !filters.type || job.type === filters.type;

      return searchMatch && locationMatch && typeMatch;
    });

    setFilteredJobs(filtered);
    setTotalPages(Math.ceil(filtered.length / 10));
    setPage(1);
  }, [filters, allJobs]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJob(jobId);
    navigate(`/jobs/${jobId}`);
  };

  const getCurrentPageJobs = () => {
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    return filteredJobs.slice(startIndex, endIndex);
  };

  return (
    <div className={`job-list-container ${selectedJob ? 'with-details' : ''}`}>
      <div className="jobs-section">
        <h2>Available Jobs</h2>

        <div className="job-filters">
          <div className="search-box">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by keywords..."
            />
          </div>

          <div className="filter-group">
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            >
              <option value="">Any Location</option>
              {JOB_LOCATIONS.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">Any Type</option>
              {Object.entries(JOB_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : getCurrentPageJobs().length === 0 ? (
          <div className="no-jobs">No jobs found</div>
        ) : (
          <>
            <div className="job-cards">
              {getCurrentPageJobs().map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onJobClick={handleJobClick}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

export default JobList;
