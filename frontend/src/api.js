const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL = !envApiUrl || envApiUrl === ''
  ? (import.meta.env.DEV ? 'http://localhost:3000' : '')
  : envApiUrl;

let loginPromise = null;

async function login(password) {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ password }),
  });
  
  return response.ok;
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });
  
  if (response.status === 401) {
    if (!loginPromise) {
      loginPromise = (async () => {
        const password = prompt('Enter password to access Jobs:');
        if (!password) {
          throw new Error('Authentication required');
        }
        const success = await login(password);
        if (!success) {
          throw new Error('Invalid password');
        }
        return true;
      })();
    }
    
    await loginPromise;
    loginPromise = null;
    
    return request(endpoint, options);
  }
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getApplications: () => request('/api/applications'),
  getApplication: (id) => request(`/api/applications/${id}`),
  createApplication: (data) =>
    request('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateApplication: (id, data) =>
    request(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteApplication: (id) =>
    request(`/api/applications/${id}`, {
      method: 'DELETE',
    }),
  getStatusBreakdown: () => request('/api/analytics/status-breakdown'),
  getTopSkills: () => request('/api/analytics/top-skills'),
  getTimeline: () => request('/api/analytics/timeline'),
  addInterview: (data) =>
    request('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addSkill: (data) =>
    request('/api/interviews/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
