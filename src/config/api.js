// Single source of truth for the backend URL.
// Defaults to the Vite proxy (/api), which forwards to VITE_PROXY_TARGET.
// Set VITE_API_URL to call a different origin directly.
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
