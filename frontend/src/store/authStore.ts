import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api-client';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      login: (token: string) => {
        Cookies.set('token', token, { expires: 1 });
        set({ token, isAuthenticated: true });
      },
      checkAuth: () => {
        const token = Cookies.get('token');
        if (token) {
          set({ token, isAuthenticated: true });
        }
      },
      logout: () => {
        Cookies.remove('token');
        set({ token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      skipHydration: true,
    }
  )
);
