const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('quittrack_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options.headers || {})
      }
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`
      };
    }

    return data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    return {
      success: false,
      message: err.message || 'Network connection issue. Please check your internet.'
    };
  }
}

// Specific API methods
export const api = {
  // Auth
  register: (body: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  demoLogin: () => apiRequest('/auth/demo', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),

  // Profile
  getProfile: () => apiRequest('/user/profile'),
  updateProfile: (body: any) => apiRequest('/user/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Smoking Logs
  getSmokingLogs: () => apiRequest('/smoking/logs'),
  logSmoking: (body: any) => apiRequest('/smoking/log', { method: 'POST', body: JSON.stringify(body) }),
  updateSmokingLog: (id: string, body: any) => apiRequest(`/smoking/log/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSmokingLog: (id: string) => apiRequest(`/smoking/log/${id}`, { method: 'DELETE' }),

  // Cravings
  getCravings: () => apiRequest('/cravings'),
  createCraving: (body: any) => apiRequest('/cravings', { method: 'POST', body: JSON.stringify(body) }),
  getCravingAnalytics: () => apiRequest('/cravings/analytics'),

  // Dashboard
  getDashboard: () => apiRequest('/dashboard'),

  // Analytics
  getSmokingAnalytics: () => apiRequest('/analytics/smoking'),
  getFinancialAnalytics: () => apiRequest('/analytics/financial'),
  getHealthAnalytics: () => apiRequest('/analytics/health'),

  // Achievements
  getAchievements: () => apiRequest('/achievements'),

  // Savings
  getSavings: () => apiRequest('/savings'),
  createSavingsGoal: (body: any) => apiRequest('/savings/goals', { method: 'POST', body: JSON.stringify(body) }),
  updateSavingsGoal: (id: string, body: any) => apiRequest(`/savings/goals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSavingsGoal: (id: string) => apiRequest(`/savings/goals/${id}`, { method: 'DELETE' })
};
