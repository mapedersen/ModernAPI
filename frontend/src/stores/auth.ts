import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UserDto } from '~/types/auth'

interface AuthState {
  user: UserDto | null
  isLoading: boolean
  isAuthenticated: boolean
  hasCheckedAuth: boolean // Track if we've checked auth on initial load
  
  // Actions
  setUser: (user: UserDto | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
  checkAuthStatus: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        hasCheckedAuth: false,

        setUser: (user) =>
          set({
            user,
            isAuthenticated: user !== null,
            isLoading: false,
            hasCheckedAuth: true, // Mark as checked when setting user
          }),

        setLoading: (loading) =>
          set({ isLoading: loading }),

        clearAuth: () =>
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedAuth: true, // Mark as checked when clearing
          }),

        checkAuthStatus: async () => {
          const state = get()
          
          // Don't check again if already checked or currently loading
          if (state.hasCheckedAuth || state.isLoading) {
            return
          }

          set({ isLoading: true })
          try {
            // Check if we have valid cookies by making a test request
            const response = await fetch('/api/auth/me', {
              method: 'GET',
              credentials: 'include', // Include cookies
            })
            
            if (response.ok) {
              const user = await response.json()
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                hasCheckedAuth: true,
              })
            } else {
              // Clear invalid auth state
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                hasCheckedAuth: true,
              })
            }
          } catch (error) {
            console.error('Auth check failed:', error)
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              hasCheckedAuth: true,
            })
          }
        },
      }),
      {
        name: 'auth-storage',
        // Only persist user and isAuthenticated, not isLoading or hasCheckedAuth
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        }),
        // After rehydration, we need to verify if the auth is still valid
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.hasCheckedAuth = false
            state.isLoading = false
            // If we have persisted auth state, we'll verify it with the server
          }
        },
      }
    ),
    { name: 'auth-store' }
  )
)