import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole =
  | 'INDIVIDUAL'
  | 'VENDOR'
  | 'RESTAURANT'
  | 'CORPORATE'
  | 'RIDER'
  | 'ADMIN'

export interface AuthUser {
  id: string
  phone: string
  name: string | null
  role: UserRole
  status: string
  fcmToken?: string | null
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  role: UserRole | null
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('fair-ride-token', token)
        }
        set({ user, token, isAuthenticated: true, role: user.role })
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('fair-ride-token')
        }
        set({ user: null, token: null, isAuthenticated: false, role: null })
      },
    }),
    {
      name: 'fair-ride-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    },
  ),
)
