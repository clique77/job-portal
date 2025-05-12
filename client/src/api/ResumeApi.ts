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

export interface Resume {
  _id: string;
  jobSeekerId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  isActive: boolean;
}

export const ResumeApi = {
  getUserResumes: async () => {
    const response = await fetch(`${API_BASE_URL}/api/resumes`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get resumes');
    }

    return response.json();
  },

  getResumeById: async (resumeId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get resume');
    }

    return response.json();
  },

  uploadResume: async (formData: FormData) => {
    const headers = getAuthHeaders(false);
    
    console.log('Uploading resume...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Resume upload failed:', error);
        throw new Error(error.message || 'Failed to upload resume');
      }

      const result = await response.json();
      console.log('Resume upload success:', {
        resumeId: result.resume?._id,
        fileName: result.resume?.fileName
      });
      return result;
    } catch (error) {
      console.error('Resume upload error:', error);
      throw error;
    }
  },

  deleteResume: async (resumeId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete resume');
    }

    return response.json();
  }
};