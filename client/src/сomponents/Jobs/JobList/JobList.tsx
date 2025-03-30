import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, JobsApi, JOB_LOCATIONS, JOB_TYPE_LABELS } from "../../../api/JobsApi";
import JobDetails from '../JobDetail/JobDetail';
import './JobList.scss';

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    query: ''
  });
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([__, value]) => value !== '')
        );

        console.log('Sending filters to API:', activeFilters);
        const response = await JobsApi.getJobs(page, 10, activeFilters);
        console.log('API response:', response);

        setJobs(response.data || []);
        const total = response.meta?.total || 0;
        setTotalPages(Math.ceil(total / 10));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch jobs');
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page, filters]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
  };

  const formatJobType = (type: string) => {
    return JOB_TYPE_LABELS[type as keyof typeof JOB_TYPE_LABELS] || type;
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJob(jobId);
    navigate(`/jobs/${jobId}`);
  };


  return (
    <div className={`job-list-container ${selectedJob ? 'with-details' : ''}`}>
      <div className="jobs-section">
        <h2>Available Jobs</h2>

        <div className="job-filters">
          <div className="search-box">
            <input
              type="text"
              name="query"
              value={filters.query}
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
        ) : jobs.length === 0 ? (
          <div className="no-jobs">No jobs found</div>
        ) : (
          <>
            <div className="job-cards">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className={`job-card ${selectedJob === job._id ? 'selected' : ''}`}
                  onClick={() => handleJobClick(job._id)}
                >
                  <h3 className="job-title">{job.title}</h3>
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
