import Cookies from 'js-cookie';
import { User } from '@/types/user';

export const setAuthToken = (token: string) => {
  Cookies.set('token', token, { expires: 1 });
};

export const setAuthUser = (user: User) => {
  Cookies.set('user', JSON.stringify(user), { expires: 1 });
};

export const getAuthToken = () => {
  return Cookies.get('token');
};

export const getAuthUser = (): User | null => {
  const user = Cookies.get('user');
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  Cookies.remove('token');
  Cookies.remove('user');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};