import { useState, useEffect, useCallback } from 'react';
import ApplicationApi from '../../../api/ApplicationApi';
import './JobApplicantsList.scss';
import PDFViewer from '../../Resume/PDFViewer/PDFViewer';

interface JobApplicantsListProps {
  jobId: string;
}

const JobApplicantsList: React.FC<JobApplicantsListProps> = ({ jobId }) => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | { _id: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

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

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
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

  return (
    <div className="job-applicants-list">
      <div className="list-header">
        <h3>Job Applicants</h3>
        <button 
          className="refresh-button" 
          onClick={handleRefresh} 
          disabled={loading}
          title="Refresh applicant list"
        >
          ↻
        </button>
      </div>
      
      {loading && <div className="applicants-loading">Loading applicants...</div>}
      
      {error && !loading && (
        <div className="applicants-error">
          Error: {error}
          <button onClick={handleRefresh} className="retry-button">Try Again</button>
        </div>
      )}
      
      {!loading && !error && applicants.length === 0 && (
        <div className="no-applicants">No applicants yet for this job.</div>
      )}
      
      {!loading && !error && applicants.length > 0 && (
        <div className="applicants-table">
          <div className="applicants-header">
            <div className="col-name">Applicant</div>
            <div className="col-date">Applied On</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Actions</div>
          </div>
          
          {applicants.map((applicant) => (
            <div key={applicant._id} className="applicant-row">
              <div className="col-name">
                <div className="applicant-name">{applicant.applicant.name}</div>
                <div className="applicant-email">{applicant.applicant.email}</div>
                {applicant.resumeId ? (
                  <div className="resume-indicator has-resume">Resume provided</div>
                ) : (
                  <div className="resume-indicator no-resume">No resume</div>
                )}
                <div className="notes-section">
                  {applicant.notes && <span className="notes-label">Notes: </span>}
                  {applicant.notes}
                </div>
              </div>
              
              <div className="col-date">
                {formatDate(applicant.appliedAt)}
              </div>
              
              <div className="col-status">
                <select 
                  value={applicant.status}
                  onChange={(e) => handleStatusChange(applicant.applicant._id, e.target.value)}
                  className={`status-${applicant.status.toLowerCase()}`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWING">Reviewing</option>
                  <option value="INTERVIEWED">Interviewed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="OFFERED">Offered</option>
                  <option value="HIRED">Hired</option>
                </select>
              </div>
              
              <div className="col-actions">
                {applicant.resumeId ? (
                  <button 
                    className="view-resume-btn"
                    onClick={() => handleViewResume(applicant.resumeId)}
                  >
                    View Resume
                  </button>
                ) : (
                  <span className="no-resume">No Resume</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedResumeId && (
        <div className="resume-preview-modal">
          <div className="resume-preview-container">
            <button className="close-button" onClick={() => setSelectedResumeId(null)}>&times;</button>
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