import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, JOB_TYPE_LABELS } from '../../../api/JobsApi';
import EditJobForm from '../EditJobForm/EditJobForm';
import DeleteJobModal from '../DeleteJobModal/DeleteJobModal';
import './JobsList.scss';

interface JobsListProps {
  jobs: Job[];
  canManage: boolean;
  onUpdate: (job: Job) => void;
  onDelete: (jobId: string) => Promise<void> | void;
}

const JobsList: React.FC<JobsListProps> = ({ jobs, canManage, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = (job: Job) => {
    setSelectedJob(job);
    setEditingJobId(job._id);
  };

  const handleDeleteClick = (job: Job) => {
    setSelectedJob(job);
    setDeletingJobId(job._id);
  };

  const handleViewApplicants = (jobId: string) => {
    navigate(`/employer/jobs/${jobId}`);
  };

  const handleJobUpdated = (updatedJob: Job) => {
    onUpdate(updatedJob);
    setEditingJobId(null);
    setSelectedJob(null);
  };

  const handleJobDeleted = async () => {
    if (selectedJob && !isDeleting) {
      try {
        setIsDeleting(true);
        setError(null);
        
        if (typeof onDelete === 'function') {
        await onDelete(selectedJob._id);
        } else {
          throw new Error('Delete handler not available');
        }
        
        setDeletingJobId(null);
        setSelectedJob(null);
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Unknown error occurred during deletion';
        
        console.error('Error deleting job:', err);
        setError(errorMessage);
        
        return false;
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'CLOSED':
        return 'status-closed';
      case 'DRAFT':
        return 'status-draft';
      default:
        return '';
    }
  };

  if (editingJobId && selectedJob) {
    return (
      <EditJobForm
        job={selectedJob}
        onSubmit={handleJobUpdated}
        onCancel={() => setEditingJobId(null)}
      />
    );
  }

  return (
    <div className="jobs-list">
      {jobs.map(job => (
        <div key={job._id} className="job-item">
          <div className="job-header">
            <h3 className="job-title">{job.title}</h3>
            {canManage && (
              <div className="job-actions">
                <button 
                  className="view-applicants-btn"
                  onClick={() => handleViewApplicants(job._id)}
                  aria-label="View applicants"
                  title="View job details and applicants"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5C8.14 5 4.96 7.73 3.84 11.5C4.96 15.27 8.14 18 12 18C15.86 18 19.04 15.27 20.16 11.5C19.04 7.73 15.86 5 12 5ZM12 16C9.88 16 8.16 14 8.16 11.5C8.16 9 9.88 7 12 7C14.12 7 15.84 9 15.84 11.5C15.84 14 14.12 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 13.5C13.1046 13.5 14 12.6046 14 11.5C14 10.3954 13.1046 9.5 12 9.5C10.8954 9.5 10 10.3954 10 11.5C10 12.6046 10.8954 13.5 12 13.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  className="edit-job-btn"
                  onClick={() => handleEditClick(job)}
                  aria-label="Edit job"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  className="delete-job-btn"
                  onClick={() => handleDeleteClick(job)}
                  aria-label="Delete job"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="job-summary">
            <span className="job-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {job.location}
            </span>
            
            <span className="job-type">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {JOB_TYPE_LABELS[job.type as keyof typeof JOB_TYPE_LABELS] || job.type}
            </span>
            
            <span className="job-salary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {job.salary.min} - {job.salary.max} {job.salary.currency}
            </span>
            <span className={`job-status ${getStatusClass(job.status)}`}>
              {job.status}
            </span>
          </div>
          
          <div className="job-description">
            <p>{job.description.length > 200 ? `${job.description.substring(0, 200)}...` : job.description}</p>
          </div>
          
          <div className="job-footer">
            <div className="job-tags">
              {job.tags.map((tag, index) => (
                <span key={index} className="job-tag">{tag}</span>
              ))}
            </div>
            <div className="job-meta">
              <div className="job-dates">
                <span>Posted: {formatDate(job.createdAt)}</span>
                {job.expiresAt && <span>Expires: {formatDate(job.expiresAt)}</span>}
              </div>
              {canManage && (
                <button
                  className="view-applicants-button"
                  onClick={() => handleViewApplicants(job._id)}
                >
                  View Applicants <span className="arrow">→</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {deletingJobId && selectedJob && (
        <DeleteJobModal
          isOpen={!!deletingJobId}
          jobTitle={selectedJob.title}
          onConfirm={handleJobDeleted}
          onCancel={() => setDeletingJobId(null)}
        />
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default JobsList; 