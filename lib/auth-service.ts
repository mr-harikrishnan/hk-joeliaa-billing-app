import { jwtDecode } from 'jwt-decode';

export const TOKEN_KEY = 'joeliaa_auth_token';
export const PUBLIC_BILL_KEY = 'joeliaa_public_bill_id';
export const ADMIN_KEY = 'joeliaa_is_admin';

export const authService = {
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PUBLIC_BILL_KEY);
      localStorage.removeItem(ADMIN_KEY);
    }
  },

  isTokenValid: () => {
    const token = authService.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        return false; // Expired
      }
      return true;
    } catch {
      return false; // Invalid token format
    }
  },

  isTokenExpired: () => {
    const token = authService.getToken();
    if (!token) return true; // If no token, consider it expired/invalid

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp && decoded.exp < currentTime;
    } catch {
      return true;
    }
  },

  // Public Bill Lock Mode Helpers
  setPublicBillId: (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PUBLIC_BILL_KEY, id);
    }
  },

  getPublicBillId: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(PUBLIC_BILL_KEY);
  },

  isPublicBillMode: () => {
    return !!authService.getPublicBillId();
  },

  setIsAdmin: (value: boolean) => {
    if (typeof window !== 'undefined') {
      if (value) localStorage.setItem(ADMIN_KEY, 'true');
      else localStorage.removeItem(ADMIN_KEY);
    }
  },

  isAdmin: () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ADMIN_KEY) === 'true';
  }
};
