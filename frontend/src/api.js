/**
 * Centralised API client for JeevanSetu backend.
 * Automatically attaches Authorization header.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TOKEN_KEY = 'jeevansetu_token';

const apiFetch = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
};

// ─── User/Auth API ────────────────────────────────────────────────────────────

export const getMe = () => apiFetch('/auth/me');

export const logoutApi = () => apiFetch('/auth/logout', { method: 'POST' });

// Old createUser replaced by Google OAuth & completeProfile
export const completeProfile = (body) =>
  apiFetch('/api/users/me/profile', { method: 'PUT', body: JSON.stringify(body) });

export const updateMe = (body) =>
  apiFetch('/api/users/me', { method: 'PUT', body: JSON.stringify(body) });

export const getHealthTip = () => apiFetch('/api/users/me/health-tip');

// Used by first-responders (public)
export const getUserByQR = (qrCodeId) => apiFetch(`/api/users/qr/${qrCodeId}`);

// ─── Emergency API ────────────────────────────────────────────────────────────

export const triggerEmergency = (body) =>
  apiFetch('/api/emergency/trigger', { method: 'POST', body: JSON.stringify(body) });

export const triggerEmergencyByQR = (body) =>
  apiFetch('/api/emergency/qr-trigger', { method: 'POST', body: JSON.stringify(body) });

export const getEmergency = (id) => apiFetch(`/api/emergency/${id}`);

export const getMyEmergencies = () => apiFetch('/api/emergency/mine');

export const resolveEmergency = (id) =>
  apiFetch(`/api/emergency/${id}/resolve`, { method: 'PATCH' });
