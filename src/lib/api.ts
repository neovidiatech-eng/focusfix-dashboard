export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/** Public website URL (for "view on site" links) */
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://focusfix.net';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('focusfix_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Central fetch wrapper that auto-handles 401 (expired/invalid token).
 * Clears localStorage and redirects to /login without crashing the UI.
 */
async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    localStorage.removeItem('focusfix_admin_token');
    localStorage.removeItem('focusfix_admin_user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.');
  }
  return res;
}

/** Authenticated JSON request; throws the server's error message on failure */
async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authFetch(`${API_BASE_URL}${path}`, { ...init, headers: { ...getAuthHeaders(), ...init.headers } });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `فشل الطلب (${res.status})`);
  return body as T;
}

const json = (method: string, data: unknown): RequestInit => ({ method, body: JSON.stringify(data) });

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface SlotRow {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_bookings: number;
  is_active: boolean;
}

export const api = {
  // Auth — uses plain fetch (no auth header needed)
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error || 'Login failed');
    return body;
  },

  // Badges & Stats
  getBadges: () => request<{ bookings: number; messages: number }>('/admin/badges'),
  getStats: (range = '30d') => request(`/admin/stats?range=${range}`),
  getAuditLog: (limit = 200) => request(`/admin/audit-log?limit=${limit}`),

  // Pricing Matrix
  getPricingMatrix: (type = 'iphone') => request(`/pricing/admin/matrix?type=${type}`),
  updatePricingMatrix: (updates: unknown[]) => request('/pricing/admin/matrix', json('PUT', { updates })),
  importPrices: (rows: unknown[], dryRun: boolean) => request('/pricing/admin/import', json('POST', { rows, dryRun })),

  // Bookings
  getBookings: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)).toString();
    return request(`/bookings/admin/all?${qs}`);
  },
  getBooking: (id: string) => request(`/bookings/admin/${id}`),
  updateBookingStatus: (id: string, status: BookingStatus, note?: string, totalFinal?: number | null) =>
    request(`/bookings/admin/${id}/status`, json('PATCH', { status, note: note || undefined, totalFinal })),
  updateBookingNotes: (id: string, notes: string) => request(`/bookings/admin/${id}/notes`, json('PATCH', { notes })),

  // Areas & slots
  getAreas: () => request('/areas/admin/all'),
  createArea: (data: unknown) => request('/areas/admin', json('POST', data)),
  updateArea: (id: string, data: unknown) => request(`/areas/admin/${id}`, json('PUT', data)),
  deleteArea: (id: string) => request(`/areas/admin/${id}`, { method: 'DELETE' }),
  getAreaSlots: (id: string) => request<SlotRow[]>(`/areas/admin/${id}/slots`),
  saveAreaSlots: (id: string, slots: SlotRow[]) => request<SlotRow[]>(`/areas/admin/${id}/slots`, json('PUT', { slots })),
  getAreaExceptions: (id: string) => request(`/areas/admin/${id}/exceptions`),
  createSlotException: (data: unknown) => request('/areas/admin/exceptions', json('POST', data)),
  deleteSlotException: (id: string) => request(`/areas/admin/exceptions/${id}`, { method: 'DELETE' }),

  // Catalog
  getAdminCatalog: () => request('/catalog/admin/all'),
  getDeviceTypes: () => request('/catalog/device-types'),
  getModels: (type = 'iphone') => request(`/catalog/models${type ? `?type=${type}` : ''}`),
  getServices: () => request('/catalog/services'),
  createModel: (data: unknown) => request('/catalog/admin/models', json('POST', data)),
  updateModel: (id: string, data: unknown) => request(`/catalog/admin/models/${id}`, json('PUT', data)),
  deleteModel: (id: string) => request(`/catalog/admin/models/${id}`, { method: 'DELETE' }),
  createService: (data: unknown) => request('/catalog/admin/services', json('POST', data)),
  updateService: (id: string, data: unknown) => request(`/catalog/admin/services/${id}`, json('PUT', data)),
  deleteService: (id: string) => request(`/catalog/admin/services/${id}`, { method: 'DELETE' }),
  updateDeviceType: (id: string, data: unknown) => request(`/catalog/admin/device-types/${id}`, json('PUT', data)),

  // Media — multipart, so the browser sets its own Content-Type boundary
  async uploadImage(file: File, alt?: string): Promise<{ id: string; url: string; width: number; height: number }> {
    const form = new FormData();
    form.append('file', file);
    if (alt) form.append('alt', alt);
    const token = localStorage.getItem('focusfix_admin_token');
    const res = await authFetch(`${API_BASE_URL}/media/admin/upload`, {
      method: 'POST',
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error || 'فشل رفع الصورة');
    return body;
  },

  // Messages
  getMessages: () => request('/contact/admin/messages'),
  getQuotes: () => request('/contact/admin/quotes'),
  updateMessageStatus: (id: string, status: string) =>
    request(`/contact/admin/messages/${id}/status`, json('PATCH', { status })),

  // Settings
  getSettings: () => request('/settings/admin'),
  updateSettings: (settings: Array<{ key: string; value: string }>) => request('/settings/admin', json('PUT', { settings })),
};
