import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Job, JobsApi, JOB_TYPE_LABELS } from "../../../api/JobsApi";
import JobDetails from '../JobDetail/JobDetail';
import JobCard from '../JobCard/JobCard';
import { motion, AnimatePresence } from 'framer-motion';
import './JobList.scss';
import { createPortal } from 'react-dom';

const listVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const POSTED_WITHIN_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '1', label: 'Last 24 hours' },
  { value: '3', label: 'Last 3 days' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];

interface TagsModalProps {
  isOpen: boolean;
  tags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  onClose: (apply: boolean) => void;
}
const TagsModal: React.FC<TagsModalProps> = ({ isOpen, tags, selectedTags, setSelectedTags, onClose }) => {
  const [search, setSearch] = useState('');
  const filteredTags = tags.filter(tag => tag.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;
  return createPortal(
    <div className="modal-overlay" onClick={() => onClose(true)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={() => onClose(true)}>&times;</button>
        <h3>Select Tags</h3>
        <div style={{ width: '100%', display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            className="tags-modal-search"
            placeholder="Search tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 0 }}
          />
          <button
            className="modal-clear-btn"
            type="button"
            onClick={() => setSelectedTags([])}
            style={{ whiteSpace: 'nowrap' }}
          >
            Clear All
          </button>
        </div>
        <div className="tags-list-modal">
          {filteredTags.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>No tags found</div>
          ) : (
            filteredTags.map(tag => (
              <label key={tag} className="tag-checkbox-modal">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={_e => {
                    setSelectedTags(
                      selectedTags.includes(tag)
                        ? selectedTags.filter(t => t !== tag)
                        : [...selectedTags, tag]
                    );
                  }}
                />
                <span>{tag}</span>
              </label>
            ))
          )}
        </div>
        <button className="modal-done-btn" onClick={() => onClose(true)}>Done</button>
      </div>
    </div>,
    document.body
  );
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
    search: '',
    minSalary: '',
    maxSalary: '',
    selectedTags: [] as string[],
    postedWithin: '',
    currency: '',
  });
  const [locations, setLocations] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth <= 768);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [modalSelectedTags, setModalSelectedTags] = useState<string[]>([]);

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
    const fetchLocationsAndTags = async () => {
      try {
        const [locationData, tagsData] = await Promise.all([
          JobsApi.getLocations(),
          JobsApi.getTags()
        ]);
        setLocations(locationData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching locations and tags:', error);
      }
    };

    fetchLocationsAndTags();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await JobsApi.getJobs(1, 100, {
          location: filters.location,
          type: filters.type,
          search: filters.search,
          postedWithin: filters.postedWithin,
          tags: filters.selectedTags,
          salary: {
            min: filters.minSalary ? Number(filters.minSalary) : undefined,
            max: filters.maxSalary ? Number(filters.maxSalary) : undefined,
            currency: filters.currency
          }
        });
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
  }, [filters]);

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

      const salaryMatch = (!filters.minSalary || !job.salary?.min || job.salary.min >= parseInt(filters.minSalary)) &&
                         (!filters.maxSalary || !job.salary?.max || job.salary.max <= parseInt(filters.maxSalary)) &&
                         (!filters.currency || !job.salary?.currency || job.salary.currency === filters.currency);

      const tagsMatch = filters.selectedTags.length === 0 || 
                       filters.selectedTags.every(tag => job.tags.includes(tag));

      // Posted within filter
      let postedWithinMatch = true;
      if (filters.postedWithin) {
        const days = parseInt(filters.postedWithin);
        const jobDate = new Date(job.createdAt);
        const now = new Date();
        const diffTime = now.getTime() - jobDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        postedWithinMatch = diffDays <= days;
      }

      return searchMatch && locationMatch && typeMatch && salaryMatch && tagsMatch && postedWithinMatch;
    });

    setFilteredJobs(filtered);
    setTotalPages(Math.ceil(filtered.length / 12));
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
    const startIndex = (page - 1) * 12;
    const endIndex = startIndex + 12;
    return filteredJobs.slice(startIndex, endIndex);
  };

  const openTagsModal = () => {
    setModalSelectedTags(filters.selectedTags);
    setIsTagsModalOpen(true);
  };
  
  const closeTagsModal = (apply: boolean) => {
    setIsTagsModalOpen(false);
    if (apply) {
      setFilters(prev => ({ ...prev, selectedTags: modalSelectedTags }));
    }
  };

  return (
    <div className={`job-list-container ${selectedJob ? 'with-details' : ''}`}>
      <h2>Available Jobs</h2>
      <div className="search-box search-box-top">
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
      <div className="job-filters">
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
          <div className="salary-filter">
            <input
              type="number"
              name="minSalary"
              value={filters.minSalary}
              onChange={handleFilterChange}
              placeholder="Min"
              min="0"
            />
            <span>-</span>
            <input
              type="number"
              name="maxSalary"
              value={filters.maxSalary}
              onChange={handleFilterChange}
              placeholder="Max"
              min="0"
            />
            <select
              className="select-animated currency-select"
              name="currency"
              value={filters.currency}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="UAH">UAH</option>
            </select>
          </div>
          <select
            className="select-animated"
            name="postedWithin"
            value={filters.postedWithin}
            onChange={handleFilterChange}
          >
            {POSTED_WITHIN_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="tags-filter">
          <button
            className="tags-modal-btn"
            type="button"
            onClick={openTagsModal}
          >
            Tags{filters.selectedTags.length > 0 ? ` ${filters.selectedTags.length}` : ''}
          </button>
        </div>
      </div>
      <div className={`jobs-main-layout${selectedJob && !isMobileView ? ' with-details' : ''}`}>
        <div className="jobs-section">
          {loading ? (
            <div className="loading">Loading jobs...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : getCurrentPageJobs().length === 0 ? (
            <div className="no-jobs">No jobs found</div>
          ) : (
            <>
              <motion.div
                className={`job-cards${selectedJob && !isMobileView ? ' single-column' : ''}`}
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
        {selectedJob && !isMobileView && (
          <div className="job-details-section">
            <JobDetails jobId={selectedJob} />
          </div>
        )}
      </div>
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
      <TagsModal
        isOpen={isTagsModalOpen}
        tags={tags}
        selectedTags={modalSelectedTags}
        setSelectedTags={setModalSelectedTags}
        onClose={closeTagsModal}
      />
    </div>
  );
};

export default JobList;
