export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mytrainer-server.onrender.com';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || API_BASE_URL.replace(/^http/, 'ws');
