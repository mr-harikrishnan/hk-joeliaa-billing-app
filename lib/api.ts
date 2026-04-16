import axios from 'axios';
import { authService } from './auth-service';

export const api = axios.create({
  baseURL: '/api', // Using relative URL since we are in Next.js
});

// Request Interceptor: Attach JWT
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we receive a 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      // Clear token and let RootGuard handle redirect (or forcefully do it here)
      authService.clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
