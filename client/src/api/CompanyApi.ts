const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface Company {
  _id: string;
  id?: string;
  name: string;
  description: string;
  logoUrl: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCreateData {
  name: string;
  description: string;
  logoUrl?: string;
}

export interface CompanyUpdateData {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export enum CompanyRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

export interface UserCompany {
  _id: string;
  id?: string;
  userId: string;
  companyId: string;
  company?: Company;
  role: CompanyRole;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  createdAt: string;
  invitedBy?: string;
}

const getAuthHeaders = (includeContentType = true): HeadersInit => {
  const token = localStorage.getItem('jobPortalToken');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
    console.log('Added Content-Type header');
  } else {
    console.log('Content-Type header not included');
  }
  
  return headers;
};

const CompanyApi = {
  getAllCompanies: async (page = 1, limit = 10): Promise<{ companies: Company[]; total: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();
      
      const normalizedCompanies = data.companies?.map((company: Company) => {
        if (company._id && !company.id) {
          return { ...company, id: company._id };
        }
        return company;
      }) || [];
      
      return {
        companies: normalizedCompanies,
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error fetching companies:', error);
      return { companies: [], total: 0 };
    }
  },

  getCompanyById: async (companyId: string): Promise<Company | null> => {
    try {
      if (typeof companyId === 'object') {
        console.error('Object passed as companyId instead of string ID', companyId);
        if (companyId && '_id' in companyId) {
          companyId = (companyId as any)._id;
          console.log('Extracted _id from object:', companyId);
        } else {
          return null;
        }
      }
      
      console.log('Fetching company with ID:', companyId);
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company');
      }

      const data = await response.json();
      
      if (data.company && data.company._id && !data.company.id) {
        data.company.id = data.company._id;
      }
      
      return data.company || null;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  },

  createCompany: async (companyData: CompanyCreateData): Promise<Company | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        throw new Error('Failed to create company');
      }

      const data = await response.json();
      console.log('Raw createCompany response:', data);
      
      let companyObject = null;
      
      if (data.company) {
        companyObject = data.company;
        console.log('Found company in company property:', companyObject);
      } else if (data.data) {
        companyObject = data.data;
        console.log('Found company in data property:', companyObject);
      } else if (data._id) {
        companyObject = data;
        console.log('Response is directly the company object:', companyObject);
      } else {
        console.warn('Unexpected response format for created company:', data);
        return null;
      }
      
      if (companyObject && companyObject._id && !companyObject.id) {
        companyObject.id = companyObject._id;
      }
      
      console.log('Normalized company object:', companyObject);
      
      if (companyObject) {
        try {
          const userData = localStorage.getItem('jobPortalUser');
          let userId = '';
          
          if (userData) {
            const user = JSON.parse(userData);
            userId = user.id || user._id;
          }
          
          if (userId) {
            console.log('Explicitly creating user-company relationship...');
            const userCompanyData = {
              companyId: companyObject._id || companyObject.id,
              userId: userId,
              role: CompanyRole.OWNER
            };
            
            const userCompanyResponse = await fetch(`${API_BASE_URL}/api/user-companies`, {
              method: 'POST',
              headers: getAuthHeaders(),
              credentials: 'include',
              body: JSON.stringify(userCompanyData),
            });
            
            const userCompanyResult = await userCompanyResponse.json();
            console.log('User-company relationship created:', userCompanyResult);
          }
        } catch (relationError) {
          console.warn('Error creating user-company relationship:', relationError);
        }
      }
      
      return companyObject;
    } catch (error) {
      console.error('Error creating company:', error);
      return null;
    }
  },

  updateCompany: async (companyId: string, companyData: CompanyUpdateData): Promise<Company | null> => {
    try {
      if (typeof companyId === 'object') {
        console.error('Object passed as companyId instead of string ID', companyId);
        if (companyId && '_id' in companyId) {
          companyId = (companyId as any)._id;
          console.log('Extracted _id from object:', companyId);
        } else {
          return null;
        }
      }
      
      console.log('Updating company with ID:', companyId);
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        throw new Error('Failed to update company');
      }

      const data = await response.json();

      if (data.company && data.company._id && !data.company.id) {
        data.company.id = data.company._id;
      }
      
      return data.company || null;
    } catch (error) {
      console.error('Error updating company:', error);
      return null;
    }
  },

  deleteCompany: async (companyId: string): Promise<boolean> => {
    try {
      if (typeof companyId === 'object') {
        console.error('Object passed as companyId instead of string ID', companyId);
        if (companyId && '_id' in companyId) {
          companyId = (companyId as any)._id;
          console.log('Extracted _id from object:', companyId);
        } else {
          return false;
        }
      }
      
      console.log('Deleting company with ID:', companyId);
      
      const headers = getAuthHeaders(true);
      console.log('Using headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({}),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Server returned error:', data);
        throw new Error(data.message || 'Failed to delete company');
      }

      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      return false;
    }
  },

  getUserCompanies: async (): Promise<UserCompany[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me/companies`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user companies');
      }

      const data = await response.json();
      console.log('Raw getUserCompanies response:', data);
      
      let userCompaniesArray: any[] = [];
      
      if (data.data && Array.isArray(data.data)) {
        userCompaniesArray = data.data;
        console.log('Found userCompanies in data property:', userCompaniesArray);
      } else if (data.userCompanies && Array.isArray(data.userCompanies)) {
        // Response format: { userCompanies: [...] }
        userCompaniesArray = data.userCompanies;
        console.log('Found userCompanies in userCompanies property:', userCompaniesArray);
      } else if (Array.isArray(data)) {
        // Response format: directly an array
        userCompaniesArray = data;
        console.log('Response is directly an array:', userCompaniesArray);
      } else {
        console.warn('Unexpected response format for userCompanies:', data);
        return [];
      }
      
      // Normalize _id to id if needed
      const normalizedUserCompanies = userCompaniesArray.map((userCompany: UserCompany) => {
        const normalized = { ...userCompany };
        if (userCompany._id && !userCompany.id) {
          normalized.id = userCompany._id;
        }
        if (userCompany.company && userCompany.company._id && !userCompany.company.id) {
          normalized.company = { ...userCompany.company, id: userCompany.company._id };
        }
        return normalized;
      }) || [];
      
      console.log('Normalized userCompanies:', normalizedUserCompanies);
      return normalizedUserCompanies;
    } catch (error) {
      console.error('Error fetching user companies:', error);
      return [];
    }
  },

  getCompanyMembers: async (companyId: string): Promise<any[]> => {
    try {
      if (typeof companyId === 'object') {
        console.error('Object passed as companyId instead of string ID', companyId);
        if (companyId && '_id' in companyId) {
          companyId = (companyId as any)._id;
          console.log('Extracted _id from object:', companyId);
        } else {
          return [];
        }
      }
      
      console.log('Fetching members for company ID:', companyId);
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/members`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company members');
      }

      const data = await response.json();
      return data.members || [];
    } catch (error) {
      console.error('Error fetching company members:', error);
      return [];
    }
  },

  addUserToCompany: async (userData: { companyId: string; userId: string; role: CompanyRole }): Promise<UserCompany | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-companies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to add user to company');
      }

      const data = await response.json();
      
      if (data.userCompany && data.userCompany._id && !data.userCompany.id) {
        data.userCompany.id = data.userCompany._id;
      }
      
      return data.userCompany || null;
    } catch (error) {
      console.error('Error adding user to company:', error);
      return null;
    }
  },

  removeUserFromCompany: async (companyId: string, userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove user from company');
      }

      return true;
    } catch (error) {
      console.error('Error removing user from company:', error);
      return false;
    }
  },

  updateUserCompanyRole: async (userCompanyId: string, role: CompanyRole): Promise<UserCompany | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-companies/${userCompanyId}/role`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      const data = await response.json();
      
      if (data.userCompany && data.userCompany._id && !data.userCompany.id) {
        data.userCompany.id = data.userCompany._id;
      }
      
      return data.userCompany || null;
    } catch (error) {
      console.error('Error updating user role:', error);
      return null;
    }
  }
};

export default CompanyApi; 