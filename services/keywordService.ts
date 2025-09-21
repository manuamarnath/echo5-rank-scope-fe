declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
  };
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://echo5-rank-scope-be.onrender.com'}/api`;

// Get token from auth context
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const fetchClients = async (token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/clients`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching keywords:', error);
    throw error;
  }
};

export const createKeyword = async (clientId: string, keywordData: any, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/clients/${clientId}/keywords`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(keywordData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create keyword: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating keyword:', error);
    throw error;
  }
};

export const updateKeyword = async (clientId: string, keywordId: string, keywordData: any, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/clients/${clientId}/keywords/${keywordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(keywordData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update keyword: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating keyword:', error);
    throw error;
  }
};

export const deleteKeyword = async (clientId: string, keywordId: string, token?: string) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}/clients/${clientId}/keywords/${keywordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete keyword: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting keyword:', error);
    throw error;
  }
};