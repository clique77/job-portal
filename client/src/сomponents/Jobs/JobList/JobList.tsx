import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Job, JobsApi, JOB_TYPE_LABELS } from "../../../api/JobsApi";
import JobDetails from '../JobDetail/JobDetail';
import JobCard from '../JobCard/JobCard';
import { motion, AnimatePresence } from 'framer-motion';
import './JobList.scss';

const listVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

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
  const [locations, setLocations] = useState<string[]>([]);
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth <= 768);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (jobId) {
      setSelectedJob(jobId);
    }
  }, [jobId]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationData = await JobsApi.getLocations();
        setLocations(locationData);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

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
    const fetchSavedJobs = async () => {
      try {
        const res = await JobsApi.getSavedJobs(1, 100);
        setSavedJobIds(res.jobs.map((job: Job) => job._id));
      } catch (e) {
        setSavedJobIds([]);
      }
    };
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    const filtered = allJobs.filter(job => {
      const isMongoId = job.company && job.company.length === 24 && /^[0-9a-fA-F]{24}$/.test(job.company);
      
      const searchMatch = !filters.search || 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (!isMongoId && job.company.toLowerCase().includes(filters.search.toLowerCase())) ||
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

  useEffect(() => {
    if (isMobileView && selectedJob) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100vw';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileView, selectedJob]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleJobClick = (jobId: string) => {
    if (isNavigating || selectedJob === jobId) return;
    setIsNavigating(true);
    setSelectedJob(jobId);
    if (!isMobileView) {
      navigate(`/jobs/${jobId}`, { replace: true });
    }
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  };

  const closeModal = () => {
    setSelectedJob(null);
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
            <svg className="search-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="7" stroke="#90caf9" strokeWidth="2" fill="#e3f2fd" />
              <line x1="14.2" y1="14.2" x2="18" y2="18" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
            </svg>
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
              className="select-animated"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            >
              <option value="">Any Location</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <select
              className="select-animated"
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
            <motion.div
              className="job-cards"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {getCurrentPageJobs().map((job) => (
                  <motion.div
                    key={job._id}
                    variants={itemVariants}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JobCard
                      job={job}
                      onJobClick={handleJobClick}
                      isSaved={savedJobIds.includes(job._id)}
                      isUnsaving={false}
                      isSelected={selectedJob === job._id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

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

      {/* Desktop/Tablet: Side panel */}
      {selectedJob && !isMobileView && (
        <div className="job-details-section">
          <JobDetails jobId={selectedJob} />
        </div>
      )}

      {/* Mobile: Bottom Sheet Modal */}
      {selectedJob && isMobileView && (
        <div className="job-details-modal-overlay" onClick={closeModal}>
          <div
            className="job-details-bottom-sheet"
            onClick={e => e.stopPropagation()}
          >
            <button className="close-modal-btn" onClick={closeModal}>&times;</button>
            <div className="modal-content">
              <JobDetails jobId={selectedJob} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
