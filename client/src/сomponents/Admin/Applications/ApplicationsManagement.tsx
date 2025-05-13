import { useState, useEffect } from 'react';
import { storage } from '../../../api/UserApi';
import './ApplicationsManagement.scss';

// Define enum values to match the employer's status values
enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  INTERVIEWED = 'INTERVIEWED',
  REJECTED = 'REJECTED',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  WITHDRAWN = 'WITHDRAWN'
}

// Map display names to enum values
const statusDisplayNames: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Pending',
  [ApplicationStatus.REVIEWING]: 'Reviewing',
  [ApplicationStatus.INTERVIEWED]: 'Interviewed',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.OFFERED]: 'Offered',
  [ApplicationStatus.HIRED]: 'Hired',
  [ApplicationStatus.WITHDRAWN]: 'Withdrawn'
};

interface Application {
  id: string;
  _id?: string;
  jobId: string;
  userId: string;
  job: {
    id: string;
    _id?: string;
    title: string;
    company: {
      id: string;
      _id?: string;
      name: string;
    };
  };
  user: {
    id: string;
    _id?: string;
    name: string;
    email: string;
  };
  status: ApplicationStatus;
  resume?: {
    id: string;
    _id?: string;
    title: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  appliedDate?: string; // This might be calculated from createdAt
}

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'detail'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch applications data
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching applications from admin endpoint...');
      // Use the admin applications endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/applications`, {
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}: ${errorText}`);
        throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Applications response:', data);
      
      const applicationsArray = data.data || data;
      console.log('Applications array (pre-normalization):', applicationsArray);
      
      if (!Array.isArray(applicationsArray)) {
        console.error('Applications data is not an array:', data);
        setApplications([]);
        return;
      }
      
      // Normalize the data to ensure id is available
      const normalizedApplications = applicationsArray.map((app: any) => {
        console.log('Processing application:', app);
        
        // Use createdAt as appliedDate if not present
        const appliedDate = app.appliedDate || app.createdAt;
        
        // Convert status to proper enum value
        let status = app.status ? app.status : ApplicationStatus.PENDING;
        
        // If it's a lowercase string, convert to enum
        if (typeof status === 'string') {
          // Try to match with enum values
          const upperStatus = status.toUpperCase();
          if (Object.values(ApplicationStatus).includes(upperStatus as ApplicationStatus)) {
            status = upperStatus as ApplicationStatus;
          } else {
            // Handle legacy statuses by mapping them to new ones
            switch(status.toLowerCase()) {
              case 'pending': status = ApplicationStatus.PENDING; break;
              case 'reviewed': status = ApplicationStatus.REVIEWING; break;
              case 'interviewed': 
              case 'offered': status = ApplicationStatus.INTERVIEWED; break;
              case 'hired': status = ApplicationStatus.HIRED; break;
              case 'rejected':
              case 'withdrawn': status = ApplicationStatus.REJECTED; break;
              default: status = ApplicationStatus.PENDING;
            }
          }
        }
        
        return {
          ...app,
          id: app._id || app.id,
          _id: app._id,
          jobId: app.job?._id || app.job?.id || app.jobId,
          userId: app.user?._id || app.user?.id || app.userId,
          appliedDate,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          status,
          job: app.job ? {
            ...app.job,
            id: app.job._id || app.job.id,
            _id: app.job._id,
            company: app.job.company ? {
              ...app.job.company,
              id: app.job.company._id || app.job.company.id,
              _id: app.job.company._id
            } : undefined
          } : undefined,
          user: app.user ? {
            ...app.user,
            id: app.user._id || app.user.id,
            _id: app.user._id
          } : undefined,
          resume: app.resume ? {
            ...app.resume,
            id: app.resume._id || app.resume.id,
            _id: app.resume._id
          } : undefined
        };
      });
      
      console.log('Normalized applications:', normalizedApplications);
      console.log(`Found ${normalizedApplications.length} applications`);
      setApplications(normalizedApplications);
    } catch (err) {
      console.error('Error in fetchApplications:', err);
      setError(`Error fetching applications: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedApplication(null);
    setViewMode('table');
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      console.log(`Updating application ${applicationId} status to: ${newStatus}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storage.getToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}: ${errorText}`);
        throw new Error(`Failed to update application status: ${response.status} ${response.statusText}`);
      }
      
      const updatedApp = await response.json();
      console.log('API response after status update:', updatedApp);
      
      // Normalize the response to match our Application interface
      const normalizedApp: Application = {
        ...updatedApp,
        id: updatedApp._id || updatedApp.id,
        jobId: updatedApp.job?._id || updatedApp.job?.id || updatedApp.jobId,
        userId: updatedApp.user?._id || updatedApp.user?.id || updatedApp.userId,
        // Ensure status is the correct enum value
        status: newStatus,
        job: updatedApp.job ? {
          ...updatedApp.job,
          id: updatedApp.job._id || updatedApp.job.id,
          company: updatedApp.job.company ? {
            ...updatedApp.job.company,
            id: updatedApp.job.company._id || updatedApp.job.company.id
          } : undefined
        } : undefined,
        user: updatedApp.user ? {
          ...updatedApp.user,
          id: updatedApp.user._id || updatedApp.user.id
        } : undefined
      };
      
      console.log('Normalized updated application:', normalizedApp);
      
      // Update application in list - directly update with the new status
      setApplications(applications.map(app => 
        app.id === applicationId ? {...app, status: newStatus, updatedAt: new Date().toISOString()} : app
      ));
      
      // Update selected application if viewing details
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication({...selectedApplication, status: newStatus, updatedAt: new Date().toISOString()});
      }
      
      setError(null);
    } catch (err) {
      console.error('Error updating application status:', err);
      setError(`Error updating application status: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDelete = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      console.log(`Deleting application with ID: ${applicationId}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete application');
      }
      
      // Remove the application from the list
      setApplications(applications.filter(app => app.id !== applicationId));
      
      // Update view if the deleted application was being viewed
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication(null);
        setViewMode('table');
      }
      
      setError(null);
    } catch (err) {
      setError('Error deleting application. Please try again.');
      console.error(err);
    }
  };

  const filteredApplications = statusFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === statusFilter);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: ApplicationStatus) => {
    // Convert to lowercase for CSS class compatibility
    const statusLower = status.toLowerCase();
    
    // Map enum values to CSS classes
    switch(status) {
      case ApplicationStatus.PENDING:
        return 'status-pending';
      case ApplicationStatus.REVIEWING:
        return 'status-reviewing';
      case ApplicationStatus.INTERVIEWED:
        return 'status-interviewed';
      case ApplicationStatus.REJECTED:
        return 'status-rejected';
      case ApplicationStatus.OFFERED:
        return 'status-offered';
      case ApplicationStatus.HIRED:
        return 'status-hired';
      case ApplicationStatus.WITHDRAWN:
        return 'status-withdrawn';
      default:
        // For any unknown status, derive class from the lowercase status value
        return `status-${statusLower}`;
    }
  };

  return (
    <div className="applications-management">
      <div className="header">
        <h2>Applications Management</h2>
        {viewMode === 'detail' && (
          <button 
            className="back-btn" 
            onClick={handleBackToList}
          >
            Back to List
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {viewMode === 'table' ? (
        <>
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="status-filter">Filter by Status:</label>
              <select 
                id="status-filter" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value={ApplicationStatus.PENDING}>{statusDisplayNames[ApplicationStatus.PENDING]}</option>
                <option value={ApplicationStatus.REVIEWING}>{statusDisplayNames[ApplicationStatus.REVIEWING]}</option>
                <option value={ApplicationStatus.INTERVIEWED}>{statusDisplayNames[ApplicationStatus.INTERVIEWED]}</option>
                <option value={ApplicationStatus.REJECTED}>{statusDisplayNames[ApplicationStatus.REJECTED]}</option>
                <option value={ApplicationStatus.OFFERED}>{statusDisplayNames[ApplicationStatus.OFFERED]}</option>
                <option value={ApplicationStatus.HIRED}>{statusDisplayNames[ApplicationStatus.HIRED]}</option>
                <option value={ApplicationStatus.WITHDRAWN}>{statusDisplayNames[ApplicationStatus.WITHDRAWN]}</option>
              </select>
            </div>
          </div>
          
          <div className="applications-table-container">
            {loading ? (
              <div className="loading">Loading applications...</div>
            ) : filteredApplications.length > 0 ? (
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job Position</th>
                    <th>Company</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(application => (
                    <tr key={application.id}>
                      <td>{application.user?.name || '-'}</td>
                      <td>{application.job?.title || '-'}</td>
                      <td>{application.job?.company?.name || '-'}</td>
                      <td>{formatDate(application.appliedDate)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                          {statusDisplayNames[application.status] || application.status}
                        </span>
                      </td>
                      <td>{application.updatedAt ? formatDate(application.updatedAt) : '-'}</td>
                      <td className="actions">
                        <button 
                          className="view-btn" 
                          onClick={() => handleViewApplication(application)}
                        >
                          View
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(application.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                No applications found
                {statusFilter !== 'all' && (
                  <span> with status "{statusFilter}"</span>
                )}
              </div>
            )}
          </div>
        </>
      ) : selectedApplication && (
        <div className="application-detail-container">
          <div className="application-header">
            <h3>{selectedApplication.job?.title || 'Job Application'}</h3>
            <div className={`status-badge ${getStatusBadgeClass(selectedApplication.status)}`}>
              {statusDisplayNames[selectedApplication.status] || selectedApplication.status}
            </div>
          </div>
          
          <div className="application-detail-content">
            <div className="application-detail-section">
              <h4>Application Details</h4>
              <div className="detail-row">
                <div className="detail-label">Applicant Name:</div>
                <div className="detail-value">{selectedApplication.user?.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Applicant Email:</div>
                <div className="detail-value">{selectedApplication.user?.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Job Title:</div>
                <div className="detail-value">{selectedApplication.job?.title}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Company:</div>
                <div className="detail-value">{selectedApplication.job?.company?.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Applied Date:</div>
                <div className="detail-value">{formatDate(selectedApplication.appliedDate)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Last Updated:</div>
                <div className="detail-value">
                  {selectedApplication.updatedAt ? formatDate(selectedApplication.updatedAt) : '-'}
                </div>
              </div>
            </div>
            
            {selectedApplication.resume && (
              <div className="application-detail-section">
                <h4>Resume</h4>
                <div className="resume-content">
                  {selectedApplication.resume.title}
                </div>
              </div>
            )}
            
            <div className="application-detail-section">
              <h4>Application Status</h4>
              <div className="status-dropdown">
                <label htmlFor="application-status">Update Status:</label>
                <select 
                  id="application-status" 
                  value={selectedApplication.status} 
                  onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value as ApplicationStatus)}
                >
                  <option value={ApplicationStatus.PENDING}>{statusDisplayNames[ApplicationStatus.PENDING]}</option>
                  <option value={ApplicationStatus.REVIEWING}>{statusDisplayNames[ApplicationStatus.REVIEWING]}</option>
                  <option value={ApplicationStatus.INTERVIEWED}>{statusDisplayNames[ApplicationStatus.INTERVIEWED]}</option>
                  <option value={ApplicationStatus.REJECTED}>{statusDisplayNames[ApplicationStatus.REJECTED]}</option>
                  <option value={ApplicationStatus.OFFERED}>{statusDisplayNames[ApplicationStatus.OFFERED]}</option>
                  <option value={ApplicationStatus.HIRED}>{statusDisplayNames[ApplicationStatus.HIRED]}</option>
                  <option value={ApplicationStatus.WITHDRAWN}>{statusDisplayNames[ApplicationStatus.WITHDRAWN]}</option>
                </select>
              </div>
            </div>
            
            <div className="application-actions">
              <button className="delete-btn" onClick={() => handleDelete(selectedApplication.id)}>
                Delete Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManagement; 