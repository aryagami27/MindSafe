const API_BASE = 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('mh_token');
}

function setToken(token) {
  localStorage.setItem('mh_token', token);
}

function clearToken() {
  localStorage.removeItem('mh_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  register: () => request('/auth/register', { method: 'POST' }),
  getMe: () => request('/users/me'),
  submitMoodLog: (data) => request('/mood-logs', { method: 'POST', body: JSON.stringify(data) }),
  submitDataMarkers: (data) => request('/data-markers', { method: 'POST', body: JSON.stringify(data) }),
  analyzeStress: () => request('/analyze/stress', { method: 'POST' }),
  getQuestions: () => request('/assessment/questions'),
  submitAssessment: (answers) => request('/assessment/submit', { method: 'POST', body: JSON.stringify({ answers }) }),
};

export { getToken, setToken, clearToken };
