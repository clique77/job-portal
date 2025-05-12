import { storage } from './UserApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Generates authorization headers for API requests
 * @param includeContentType Whether to include the Content-Type header (should be false for DELETE requests or when not sending a JSON body)
 * @returns Headers object with authorization and optional content-type
 */
const getAuthHeaders = (includeContentType = true) => {
  const token = storage.getToken();
  const headers: Record<string, string> = {};
  
  // Only include Content-Type for requests with a body
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Include Authorization if we have a token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
  REMOTE = 'REMOTE',
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: JobType;
  category: string;
  tags: string[];
  employer: string | {
    _id: string;
    name: string;
    email: string;
  };
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export interface JobCreateData {
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: JobType;
  category: string;
  tags: string[];
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  expiresAt?: string;
}

export interface JobUpdateData {
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type?: JobType;
  category?: string;
  tags?: string[];
  status?: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  expiresAt?: string;
}

export const JOB_CATEGORIES = [
  'Software Development',
  'Design',
  'Marketing',
  'Sales'
];

export const JOB_LOCATIONS = [
  'Kyiv',
  'Lviv',
  'Kharkiv',
  'Odesa',
  'Remote'
];

export const JOB_TYPE_LABELS = {
  'FULL_TIME': 'Full Time',
  'PART_TIME': 'Part Time',
  'CONTRACT': 'Contract',
  'INTERNSHIP': 'Internship',
  'FREELANCE': 'Freelance',
  'REMOTE': 'Remote',
};

export const JobsApi = {
  getJobs: async (page: number, limit: number, filters: any) => {
    try {
      console.log('1. Starting API request with:', { page, limit, filters });
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.type && { type: filters.type })
      });

      console.log('2. Making request to:', `${API_BASE_URL}/api/jobs?${queryParams}`);
      const response = await fetch(`${API_BASE_URL}/api/jobs?${queryParams}`);
      
      console.log('3. Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      console.log('4. API Response data:', data);
      return data;
    } catch (error) {
      console.error('5. Error in getJobs:', error);
      throw error;
    }
  },

  getJobById: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/getJob/${jobId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch job by id');
    }

    return response.json();
  },

  applyToJob: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/apply/${jobId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply to job');
    }

    return response.json();
  },

  createJob: async (jobData: JobCreateData): Promise<Job> => {
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/createJob`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create job');
      }

      const result = await response.json();
      return result.job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  updateJob: async (jobId: string, jobData: JobUpdateData): Promise<Job> => {
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/updateJob/${jobId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update job');
      }

      const result = await response.json();
      return result.job;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  deleteJob: async (jobId: string): Promise<boolean> => {
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/deleteJob/${jobId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(false),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete job');
      }

      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  getCompanyJobs: async (companyId: string): Promise<Job[]> => {
    try {
      console.log(`Fetching jobs for company: ${companyId}`);
      localStorage.removeItem(`companyJobs_${companyId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/jobs`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
        cache: 'no-cache'
      });

      console.log('Company jobs API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('API error fetching company jobs:', error);
        throw new Error(error.message || 'Failed to get company jobs');
      }

      const result = await response.json();
      console.log('Company jobs response:', result);
      
      if (result.data && Array.isArray(result.data)) {
        console.log(`Successfully loaded ${result.data.length} jobs for company ${companyId}`);
        return result.data;
      } else if (Array.isArray(result)) {
        console.log(`Successfully loaded ${result.length} jobs for company ${companyId} (direct array response)`);
        return result;
      } else {
        console.error('Invalid company jobs response format:', result);
        return [];
      }
    } catch (error) {
      console.error('Error getting company jobs:', error);
      return [];
    }
  },

  saveJob: async (jobId: string): Promise<void> => {
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  },

  unsaveJob: async (jobId: string): Promise<void> => {
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/save`, {
        method: 'DELETE',
        headers: getAuthHeaders(false),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unsave job');
      }
    } catch (error) {
      console.error('Error unsaving job:', error);
      throw error;
    }
  },

  getSavedJobs: async (): Promise<Job[]> => {
    try {
      const token = storage.getToken();
      if (!token) {
        return [];
      }
      
      const response = await fetch(`${API_BASE_URL}/api/jobs/saved`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        return [];
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch saved jobs');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      return [];
    }
  },

  isJobSaved: async (jobId: string): Promise<boolean> => {
    try {
      const token = storage.getToken();
      
      if (!token) {
        return false;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/saved`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        return false;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check if job is saved');
      }

      return response.json();
    } catch (error) {
      console.error('Error checking if job is saved:', error);
      return false;
    }
  },

  getLocations: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/locations`);
      
      if (!response.ok) {
        console.error('Failed to fetch locations:', response.status);
        return JOB_LOCATIONS;
      }
      
      const result = await response.json();
      return result.data && result.data.length > 0 
        ? result.data 
        : JOB_LOCATIONS;
    } catch (error) {
      console.error('Error fetching job locations:', error);
      return JOB_LOCATIONS;
    }
  }
}
