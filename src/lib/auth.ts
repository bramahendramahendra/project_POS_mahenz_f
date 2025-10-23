import Cookies from 'js-cookie';
import { User } from '@/types/user';

// Set auth token
export const setAuthToken = (token: string) => {
  Cookies.set('token', token, { expires: 1 }); // 1 day
};

// Set user data
export const setAuthUser = (user: User) => {
  Cookies.set('user', JSON.stringify(user), { expires: 1 });
};

// ✅ BARU: Set allowed paths
export const setAllowedPaths = (paths: string[]) => {
  Cookies.set('allowedPaths', JSON.stringify(paths), { expires: 1 });
};

// Get auth token
export const getAuthToken = (): string | undefined => {
  return Cookies.get('token');
};

// Get user data
export const getAuthUser = (): User | null => {
  const userStr = Cookies.get('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// ✅ BARU: Get allowed paths
export const getAllowedPaths = (): string[] => {
  const pathsStr = Cookies.get('allowedPaths');
  if (!pathsStr) return [];
  
  try {
    return JSON.parse(pathsStr);
  } catch {
    return [];
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// ✅ BARU: Check if user can access path
export const canAccessPath = (pathname: string): boolean => {
  const allowedPaths = getAllowedPaths();
  
  // Jika tidak ada allowed paths, anggap tidak bisa akses
  if (allowedPaths.length === 0) {
    return false;
  }
  
  // Check apakah pathname ada di allowed paths
  // Support exact match atau startsWith untuk parent routes
  return allowedPaths.some(allowedPath => {
    // Exact match
    if (pathname === allowedPath) return true;
    
    // Parent route match (e.g., /master allows /master/menu)
    if (pathname.startsWith(allowedPath + '/')) return true;
    
    return false;
  });
};

// Clear all auth data
export const clearAuth = () => {
  Cookies.remove('token');
  Cookies.remove('user');
  Cookies.remove('allowedPaths');  // ✅ Remove allowed paths too
};