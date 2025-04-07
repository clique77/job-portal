const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export enum JobType {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  CONTRACT = 'Contract',
  INTERNSHIP = 'Internship',
  TEMPORARY = 'Temporary',
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
  'FULL_TIME': 'Full time',
  'PART_TIME': 'Part time',
  'CONTRACT': 'Contract',
  'INTERNSHIP': 'Internship',
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply to job');
    }

    return response.json();
  }
}
