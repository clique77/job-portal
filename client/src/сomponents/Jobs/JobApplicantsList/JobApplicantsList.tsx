import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationApi from '../../../api/ApplicationApi';
import './JobApplicantsList.scss';
import PDFViewer from '../../Resume/PDFViewer/PDFViewer';

interface JobApplicantsListProps {
  jobId: string;
  companyId?: string;
}

const JobApplicantsList: React.FC<JobApplicantsListProps> = ({ jobId, companyId }) => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | { _id: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  const fetchApplicants = useCallback(async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching applicants for job: ${jobId}`);
      const data = await ApplicationApi.getJobApplicants(jobId);
      
      if (Array.isArray(data)) {
        console.log(`Found ${data.length} applicants for job ${jobId}`);
        setApplicants(data);
      } else {
        console.error('Invalid applicants data format:', data);
        setError('Received invalid data format from server');
        setApplicants([]);
      }
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to load applicants';
      console.error('Error fetching applicants:', err);
      setError(errorMessage);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleStatusChange = async (applicantId: string, newStatus: string, applicantName: string) => {
    if (isUpdating) {
      console.log('Already processing an update, please wait...');
      return;
    }
    
    try {
      setIsUpdating(true);
      setError(null); // Clear any previous errors
      
      console.log(`Updating status for applicant ${applicantId} to ${newStatus}`);
      
      // Validate status before sending to API
      const validStatuses = ['PENDING', 'REVIEWING', 'INTERVIEWED', 'REJECTED', 'OFFERED', 'HIRED', 'WITHDRAWN'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}. Valid statuses are: ${validStatuses.join(', ')}`);
      }
      
      await ApplicationApi.updateApplicationStatus(jobId, applicantId, newStatus);
      
      console.log('Status updated successfully');
      
      setApplicants(prevApplicants => 
        prevApplicants.map(applicant => 
          applicant.applicant._id === applicantId 
            ? { ...applicant, status: newStatus } 
            : applicant
        )
      );
      
      // Show success message
      setSuccessMessage(`${applicantName}'s status updated to ${newStatus.toLowerCase()}`);
      setShowSuccessMessage(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to update status';
      console.error('Error updating status:', err);
      
      setError(`Failed to update applicant status: ${errorMessage}`);
      
      fetchApplicants();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = () => {
    fetchApplicants();
  };

  const handleViewResume = (resumeId: string | { _id: string } | undefined) => {
    if (!resumeId) {
      alert('No resume available for this applicant');
      return;
    }
    
    console.log('Viewing resume with ID:', resumeId);
    setSelectedResumeId(resumeId);
  };

  const handleBack = () => {
    if (companyId) {
      navigate(`/company/${companyId}`);
    } else {
      // Try to get job details to find company
      try {
        navigate(-1); // Go back to previous page
      } catch (err) {
        // Fallback route if going back fails
        navigate('/companies');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'PENDING':
        return '#d97706';
      case 'REVIEWING':
        return '#2563eb';
      case 'INTERVIEWED':
        return '#7c3aed';
      case 'REJECTED':
        return '#dc2626';
      case 'OFFERED':
        return '#059669';
      case 'HIRED':
        return '#047857';
      case 'WITHDRAWN':
        return '#4b5563';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="job-applicants-list">
      {showSuccessMessage && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="navigation-header">
        <button className="back-button" onClick={handleBack}>
          Back to Company
        </button>
      </div>
      
      <div className="list-header">
        <h3>
          Job Applicants
          {!loading && !error && applicants.length > 0 && (
            <span className="applicant-count">{applicants.length}</span>
          )}
        </h3>
        <button 
          className="refresh-button" 
          onClick={handleRefresh} 
          disabled={loading}
          title="Refresh applicant list"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {loading && (
        <div className="applicants-loading">
          <div className="loading-spinner"></div>
          <div>Loading applicants...</div>
        </div>
      )}
      
      {error && !loading && (
        <div className="applicants-error">
          <div>Error: {error}</div>
          <button onClick={handleRefresh} className="retry-button">Try Again</button>
        </div>
      )}
      
      {!loading && !error && applicants.length === 0 && (
        <div className="no-applicants">
          <div className="empty-state-message">No applicants yet for this job.</div>
          <div className="empty-state-hint">Check back later or share your job posting more widely.</div>
        </div>
      )}
      
      {!loading && !error && applicants.length > 0 && (
        <div className="applicants-container">
          <div className="applicants-filters">
            <div className="search-count">{applicants.length} applicant{applicants.length !== 1 ? 's' : ''}</div>
          </div>
          
          <div className="applicants-table">
            <div className="applicants-header">
              <div className="col-name">Applicant</div>
              <div className="col-date">Applied On</div>
              <div className="col-status">Status</div>
            </div>
            
            <div className="applicants-list">
              {applicants.map((applicant) => {
                const statusColor = getStatusColor(applicant.status);
                return (
                  <div key={applicant._id} className="applicant-card">
                    <div className="applicant-main-info applicant-main-info-three-col">
                      <div className="col-name">
                        <div className="applicant-name">{applicant.applicant.name}</div>
                        <div className="applicant-email">
                          {applicant.applicant.email}
                        </div>
                        
                        <div className="resume-badge-container">
                          {applicant.resumeId ? (
                            <div className="resume-badge has-resume" onClick={() => handleViewResume(applicant.resumeId)}>
                              View Resume
                            </div>
                          ) : (
                            <div className="resume-badge no-resume">
                              No Resume
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-date">
                        <div className="date-applied">
                          {formatDate(applicant.appliedAt)}
                        </div>
                      </div>
                      
                      <div className="col-status">
                        <div className="status-info">
                          <div 
                            className="status-indicator" 
                            style={{backgroundColor: statusColor}}
                          ></div>
                          <select 
                            value={applicant.status}
                            onChange={(e) => handleStatusChange(applicant.applicant._id, e.target.value, applicant.applicant.name)}
                            className={`status-select status-${applicant.status.toLowerCase()}`}
                            style={{borderColor: statusColor}}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWING">Reviewing</option>
                            <option value="INTERVIEWED">Interviewed</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="OFFERED">Offered</option>
                            <option value="HIRED">Hired</option>
                            <option value="WITHDRAWN">Withdrawn</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {applicant.notes && (
                      <div className="notes-section">
                        <span className="notes-label">Notes:</span>
                        {applicant.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {selectedResumeId && (
        <div className="resume-preview-modal">
          <div className="resume-preview-container">
            <button className="close-button" onClick={() => setSelectedResumeId(null)}>
              &times;
            </button>
            <PDFViewer 
              resumeId={selectedResumeId} 
              onError={(error) => console.error('PDF viewer error:', error)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicantsList;