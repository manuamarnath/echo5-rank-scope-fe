const API_BASE = '/api';

// Get auth token from localStorage
const getAuthToken = () => {
  // Support both keys used in the app: 'token' and 'auth_token'
  return localStorage.getItem('token') || localStorage.getItem('auth_token');
};

declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
  };
};

export interface Brief {
  id?: string;
  title: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  url: string;
  contentType: 'blog' | 'landing-page' | 'product-page' | 'guide';
  wordCount: number;
  tone: 'professional' | 'casual' | 'technical' | 'conversational';
  targetAudience: string;
  outline: string[];
  metaTitle: string;
  metaDescription: string;
  assignedTo: string;
  dueDate: string;
  status?: 'draft' | 'review' | 'approved' | 'in-progress' | 'completed';
  notes: string;
  clientId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BriefFilters {
  clientId?: string;
  status?: string;
  assignedTo?: string;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Error handling utility
const handleApiError = (error: any, defaultMessage: string) => {
  if (error.response) {
    // Server responded with error status
    const errorData = error.response.data;
    return new Error(errorData.message || errorData.error || defaultMessage);
  } else if (error.request) {
    // Request made but no response received
    return new Error('Network error - please check your connection');
  } else {
    // Something else happened
    return new Error(defaultMessage);
  }
};

export const fetchBriefs = async (filters?: BriefFilters, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters?.clientId) queryParams.append('clientId', filters.clientId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
    if (filters?.keyword) queryParams.append('keyword', filters.keyword);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const response = await fetch(`${API_BASE}/briefs?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch briefs: ${response.statusText}`);
    }

    const data = await response.json();
    // Handle both paginated response and direct array
    return data.data || data;
  } catch (error) {
    console.error('Error fetching briefs:', error);
    throw handleApiError(error, 'Failed to fetch briefs');
  }
};

export const fetchBrief = async (briefId: string, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/briefs/${briefId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch brief: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching brief:', error);
    throw handleApiError(error, 'Failed to fetch brief');
  }
};

export const createBrief = async (briefData: Omit<Brief, 'id' | 'createdAt' | 'updatedAt'>, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/briefs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(briefData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Failed to create brief: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating brief:', error);
    throw handleApiError(error, 'Failed to create brief');
  }
};

export const updateBrief = async (briefId: string, briefData: Partial<Brief>, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/briefs/${briefId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(briefData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Failed to update brief: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating brief:', error);
    throw handleApiError(error, 'Failed to update brief');
  }
};

export const deleteBrief = async (briefId: string, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/briefs/${briefId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Failed to delete brief: ${errorData.error || response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting brief:', error);
    throw handleApiError(error, 'Failed to delete brief');
  }
};

export const generateBriefContent = async (briefId: string, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/briefs/${briefId}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Failed to generate content: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating brief content:', error);
    throw handleApiError(error, 'Failed to generate brief content');
  }
};

export const duplicateBrief = async (briefId: string, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/briefs/${briefId}/duplicate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Failed to duplicate brief: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error duplicating brief:', error);
    throw handleApiError(error, 'Failed to duplicate brief');
  }
};

export const fetchClients = async (token?: string) => {
  try {
    const authToken = token || getAuthToken();
    const hasToken = !!authToken;
    const url = hasToken ? '/api/clients' : '/api/clients/demo';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (hasToken) headers['Authorization'] = `Bearer ${authToken}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw handleApiError(error, 'Failed to fetch clients');
  }
};

export const fetchKeywords = async (clientId: string, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/keywords?clientId=${clientId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch keywords: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching keywords:', error);
    throw handleApiError(error, 'Failed to fetch keywords');
  }
};

export default {
  fetchBriefs,
  fetchBrief,
  createBrief,
  updateBrief,
  deleteBrief,
  generateBriefContent,
  duplicateBrief,
  fetchClients,
  fetchKeywords,
};