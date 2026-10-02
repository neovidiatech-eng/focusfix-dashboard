const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('focusfix_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  // Badges & Stats
  async getBadges() {
    const res = await fetch(`${API_BASE_URL}/admin/badges`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getAuthHeaders() });
    return res.json();
  },

  // Pricing Matrix
  async getPricingMatrix(type = 'iphone') {
    const res = await fetch(`${API_BASE_URL}/pricing/admin/matrix?type=${type}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updatePricingMatrix(updates: any[]) {
    const res = await fetch(`${API_BASE_URL}/pricing/admin/matrix`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ updates }),
    });
    if (!res.ok) throw new Error('Failed to update matrix');
    return res.json();
  },

  // Bookings
  async getBookings(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/bookings/admin/all?${qs}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateBookingStatus(id: string, status: string, note?: string) {
    const res = await fetch(`${API_BASE_URL}/bookings/admin/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  // Areas
  async getAreas() {
    const res = await fetch(`${API_BASE_URL}/areas`);
    return res.json();
  },

  async updateArea(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/areas/admin/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE_URL}/settings/admin`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateSettings(settings: Array<{ key: string; value: string }>) {
    const res = await fetch(`${API_BASE_URL}/settings/admin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ settings }),
    });
    return res.json();
  },
};
