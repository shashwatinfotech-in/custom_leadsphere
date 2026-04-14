const API_URL = import.meta.env.VITE_API_URL;

export const api = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Something went wrong';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (e) {
      // Fallback if not JSON
    }

    if (response.status === 401 && (message.includes('Token') || message.includes('No token'))) {
       localStorage.removeItem('token');
       localStorage.removeItem('user');
    }

    throw new Error(message);
  }

  return response.json();
};
