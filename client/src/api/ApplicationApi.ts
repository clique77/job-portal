const API_BASE_URL = 'http://localhost:3000/api';

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

const ApplicationApi = {
  getUserApplications: async (): Promise<Application[] | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/me/applications`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
  
      const data = await response.json();
      return data.data?.applications || [];
    } catch (error) {
      console.error('Error fetching applications: ', error);
      throw error;
    }
  },

  checkApplication: async (jobId: string): Promise<ApplicationStatus | undefined> => {
    try {
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
      throw error;
    }
  },

  applyToJob: async (jobId: string, data: ApplicationData): Promise<Application | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to apply to job');
      }

      return response.json();
    } catch (error) {
      console.error('Error applying to job: ', error);
      throw error;
    }
  },

  withdrawApplication: async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/withdraw`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error withdrawing application');
      }

      return response.json();
    } catch (error) {
      console.error('Error withdrawing application: ', error);
      throw error;
    }
  }
};

export default ApplicationApi;
