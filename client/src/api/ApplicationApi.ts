const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getAuthHeaders = (includeContentType = true): HeadersInit => {
  const token = localStorage.getItem('jobPortalToken');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

interface ApplicationData {
  notes?: string;
  resumeId?: string;
}
  
export interface ApplicationStatus {
  hasApplied: boolean;
  status?: string;
}

interface Application {
  job: {
    _id: string;
    title: string;
    company: string;
  };
  application: {
    status: string;
    appliedAt: string;
    notes?: string;
    resumeId?: string;
  };
}

interface Applicant {
  _id: string;
  applicant: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  resumeId?: string;
}

const ApplicationApi = {
  getUserApplications: async (): Promise<Application[] | undefined> => {
    try {
      const token = localStorage.getItem('jobPortalToken');
      if (!token) {
        return [];
      }
      
      const response = await fetch(`${API_BASE_URL}/api/me/applications`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        return [];
      }

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
  
      const data = await response.json();
      return data.data?.applications || [];
    } catch (error) {
      console.error('Error fetching applications: ', error);
      return [];
    }
  },

  checkApplication: async (jobId: string): Promise<ApplicationStatus | undefined> => {
    try {
      const token = localStorage.getItem('jobPortalToken');
      if (!token) {
        return { hasApplied: false, status: undefined };
      }
      
      const applications = await ApplicationApi.getUserApplications();
      if (!applications || applications.length === 0) {
        return { hasApplied: false, status: undefined };
      }
      
      const applicationStatus = applications.find(app => app.job._id === jobId);

      return {
        hasApplied: !!applicationStatus,
        status: applicationStatus?.application.status
      };
    } catch (error) {
      console.error('Error checking application: ', error);
      return { hasApplied: false, status: undefined };
    }
  },

  applyToJob: async (jobId: string, data: ApplicationData): Promise<Application | undefined> => {
    try {
      const token = localStorage.getItem('jobPortalToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Applying to job with data:', {
        jobId,
        notes: data.notes || 'No notes',
        hasResumeId: !!data.resumeId,
        resumeId: data.resumeId
      });
      
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (response.status === 401) {
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to apply to job');
      }

      const result = await response.json();
      console.log('Application response:', result);
      return result;
    } catch (error) {
      console.error('Error applying to job: ', error);
      throw error;
    }
  },

  withdrawApplication: async (jobId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('jobPortalToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/withdraw`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error withdrawing application');
      }

      return response.json();
    } catch (error) {
      console.error('Error withdrawing application: ', error);
      throw error;
    }
  },
  
  getJobApplicants: async (jobId: string): Promise<Applicant[]> => {
    try {
      const token = localStorage.getItem('jobPortalToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applicants`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch job applicants');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching job applicants: ', error);
      throw error;
    }
  },
  
  updateApplicationStatus: async (
    jobId: string, 
    applicantId: string, 
    status: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('jobPortalToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log(`Trying to update application status: ${status} for job: ${jobId}, applicant: ${applicantId}`);
      
      // First attempt using PATCH
      let patchFailed = false;
      try {
        const patchResponse = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applicants/${applicantId}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ status, notes }),
        });
        
        if (patchResponse.ok) {
          console.log('PATCH method successful');
          const data = await patchResponse.json();
          return data.success || false;
        } else {
          console.log(`PATCH method failed with status: ${patchResponse.status}`);
          patchFailed = true;
        }
      } catch (patchError) {
        console.log('PATCH method failed with error:', patchError);
        patchFailed = true;
      }
      
      // If PATCH failed, use our proxy POST method
      if (patchFailed) {
        console.log('Attempting fallback with POST method');
        
        const postData = { 
          jobId, 
          applicantId, 
          status, 
          notes 
        };
        
        console.log('Sending data to proxy:', postData);
        
        const response = await fetch(`${API_BASE_URL}/api/applications/update-status`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(postData),
        });

        if (response.status === 401) {
          throw new Error('Authentication required');
        }

        console.log(`POST response status: ${response.status}`);
        
        if (!response.ok) {
          // Try to parse error if possible
          try {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update application status');
          } catch (jsonError) {
            // Handle non-JSON responses
            throw new Error(`Failed to update application status. Server responded with: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        console.log('POST method response:', data);
        return data.success || false;
      }
      
      throw new Error('Failed to update application status through both methods');
    } catch (error) {
      console.error('Error updating application status: ', error);
      throw error;
    }
  }
};

export default ApplicationApi;
