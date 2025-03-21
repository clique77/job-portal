const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  TEMPORARY = 'TEMPORARY',
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
  getJobs: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    console.log('Request URL:', `${API_BASE_URL}/api/jobs?${queryParams.toString()}`);

    const response = await fetch(`${API_BASE_URL}/api/jobs?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch jobs');
    }

    const responseData = await response.json();

    return {
      data: responseData.jobs.jobs,
      meta: {
        total: responseData.jobs.total,
        pages: responseData.jobs.pages
      }
    };
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
