import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api-client';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      login: async (identifier: string, password: string) => {
        const response = await apiClient.login(identifier, password);

        Cookies.set('token', response.token, { expires: 1 });

        set({ token: response.token, isAuthenticated: true });
      },
      checkAuth: async () => {
        const token = Cookies.get('token');
        if (token) {
          const isValid = await apiClient.verifyToken();
          if (isValid) {
            set({ token, isAuthenticated: true });
          } else {
            Cookies.remove('token');
            set({ token: null, isAuthenticated: false });
          }
        } else {
          set({ token: null, isAuthenticated: false });
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
