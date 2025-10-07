// src/lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import { clearAuth } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor: Tambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ BARU: Response interceptor untuk handle error
api.interceptors.response.use(
  (response) => {
    // Jika response success, return langsung
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (token invalid/expired)
    if (error.response?.status === 401) {
      console.log('[API] Unauthorized - Token invalid atau expired, auto logout...');
      
      // Clear auth data
      clearAuth();
      
      // Redirect ke login (hanya jika di client-side)
      if (typeof window !== 'undefined') {
        // Simpan current path untuk redirect setelah login
        const currentPath = window.location.pathname;
        window.location.href = `/login?from=${currentPath}`;
      }
    }

    // Handle 403 Forbidden (tidak punya akses)
    if (error.response?.status === 403) {
      console.log('[API] Forbidden - User tidak memiliki akses ke resource ini');
      // Bisa tambah notification atau alert di sini
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.log('[API] Not Found - Resource tidak ditemukan');
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.log('[API] Server Error - Terjadi kesalahan di server');
      // Bisa tampilkan error notification
    }

    return Promise.reject(error);
  }
);

export default api;