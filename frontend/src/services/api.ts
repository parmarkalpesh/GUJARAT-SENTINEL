// ============================================================
// Gujarat Sentinel — API Service
// ============================================================
const API_BASE = 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('sentinel_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    }),
  me: () => request<any>('/auth/me'),

  // Dashboard
  dashboardStats: () => request<any>('/dashboard/stats'),
  recentAlerts: () => request<any[]>('/dashboard/recent-alerts'),
  recentEvents: () => request<any[]>('/dashboard/recent-events'),
  recentDetections: () => request<any[]>('/dashboard/recent-detections'),
  dashboardMetrics: () => request<any>('/dashboard/metrics'),

  // Cameras
  cameras: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/cameras${qs}`);
  },
  camera: (id: string) => request<any>(`/cameras/${id}`),
  createCamera: (data: any) => request<any>('/cameras', { method: 'POST', body: JSON.stringify(data) }),
  updateCamera: (id: string, data: any) => request<any>(`/cameras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCamera: (id: string) => request<any>(`/cameras/${id}`, { method: 'DELETE' }),

  // Vehicles
  vehicleSearch: (params: Record<string, string>) => {
    const qs = '?' + new URLSearchParams(params).toString();
    return request<any[]>(`/vehicles/search${qs}`);
  },
  vehicleProfile: (plate: string) => request<any>(`/vehicles/${plate}`),
  vehicleRoute: (plate: string) => request<any[]>(`/vehicles/${plate}/route`),

  // Watchlist
  watchlist: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/watchlist${qs}`);
  },
  watchlistEntry: (id: string) => request<any>(`/watchlist/${id}`),
  createWatchlist: (data: any) => request<any>('/watchlist', { method: 'POST', body: JSON.stringify(data) }),
  updateWatchlist: (id: string, data: any) => request<any>(`/watchlist/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWatchlist: (id: string) => request<any>(`/watchlist/${id}`, { method: 'DELETE' }),
  checkWatchlist: (plate: string) => request<any>('/watchlist/check', { method: 'POST', body: JSON.stringify({ plate }) }),

  // Alerts
  alerts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/alerts${qs}`);
  },
  alert: (id: string) => request<any>(`/alerts/${id}`),
  acknowledgeAlert: (id: string) => request<any>(`/alerts/${id}/acknowledge`, { method: 'POST' }),
  resolveAlert: (id: string, notes?: string) => request<any>(`/alerts/${id}/resolve`, { method: 'POST', body: JSON.stringify({ notes }) }),
  dismissAlert: (id: string) => request<any>(`/alerts/${id}/dismiss`, { method: 'POST' }),

  // Incidents
  incidents: () => request<any[]>('/incidents'),
  incident: (id: string) => request<any>(`/incidents/${id}`),
  createIncident: (data: any) => request<any>('/incidents', { method: 'POST', body: JSON.stringify(data) }),
  updateIncident: (id: string, data: any) => request<any>(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Events
  events: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/events${qs}`);
  },

  // Audit
  auditLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/audit${qs}`);
  },

  // Users
  users: () => request<any[]>('/users'),
  updateUserRole: (id: string, role: string) => request<any>(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),

  // Integrations
  integrations: () => request<any[]>('/integrations'),

  // System
  systemMetrics: () => request<any>('/system/metrics'),

  // Reports
  vehicleMovementReport: (plate: string) => request<any>(`/reports/vehicle-movement?plate=${plate}`),
  alertSummaryReport: () => request<any>('/reports/alert-summary'),
  cameraHealthReport: () => request<any>('/reports/camera-health'),

  // Search
  globalSearch: (q: string) => request<{ results: any[] }>(`/search?q=${encodeURIComponent(q)}`),

  // Demo
  startDemo: () => request<any>('/demo/start', { method: 'POST' }),
  stopDemo: () => request<any>('/demo/stop', { method: 'POST' }),
  demoStatus: () => request<any>('/demo/status'),

  // Health
  health: () => fetch(`${API_BASE}/health`).then(r => r.json()),
};
