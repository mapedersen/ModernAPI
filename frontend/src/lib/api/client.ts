import { createServerFn } from '@tanstack/react-start'
import { getHeader, setHeader } from '@tanstack/react-start/server'
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserDto, 
  RefreshTokenRequest,
  ChangePasswordRequest,
  LogoutRequest,
  LogoutResponse,
  OperationResult
} from '~/types/auth'
import type { GetUsersResponse } from '~/types/user'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000'

// Helper to extract cookies
function extractTokenFromCookies(cookies: string, tokenName: string): string | null {
  const cookieArray = cookies?.split(';') || []
  const tokenCookie = cookieArray
    .find(cookie => cookie.trim().startsWith(`${tokenName}=`))
    ?.split('=')[1]
  return tokenCookie || null
}

// Helper to set secure cookies
function setSecureTokens(accessToken: string, refreshToken: string) {
  
  setHeader('Set-Cookie', [
    `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/`, // 15 min
    `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/` // 7 days
  ].join(', '))
}

// Helper to clear cookies
function clearTokenCookies() {
  
  setHeader('Set-Cookie', [
    `accessToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`,
    `refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`
  ].join(', '))
}

// Server Functions (BFF Layer)
export const loginUser = createServerFn({ method: 'POST' })
  .validator((data: LoginRequest) => data)
  .handler(async ({ data }) => {
    console.log('Server function received data:', data)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Authentication failed')
      }

      const authResult: AuthResponse = await response.json()
      
      // Store JWT tokens in secure HTTP-only cookies
      setSecureTokens(authResult.accessToken, authResult.refreshToken)
      
      return { success: true, user: authResult.user }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed')
    }
})

export const registerUser = createServerFn({ method: 'POST' })
  .validator((data: RegisterRequest) => data)
  .handler(async ({ data }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Registration failed')
      }

      const authResult: AuthResponse = await response.json()
      
      // Store JWT tokens in secure HTTP-only cookies
      setSecureTokens(authResult.accessToken, authResult.refreshToken)
      
      return { success: true, user: authResult.user }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed')
    }
  })

export const getCurrentUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const cookies = getHeader('Cookie') || ''
      const accessToken = extractTokenFromCookies(cookies, 'accessToken')
      
      if (!accessToken) {
        return null
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        // Try to refresh token
        const refreshToken = extractTokenFromCookies(cookies, 'refreshToken')
        if (refreshToken) {
          const refreshResponse = await refreshTokens({ data: { refreshToken } })
          if (refreshResponse.success && refreshResponse.user) {
            return refreshResponse.user
          }
        }
        clearTokenCookies()
        return null
      }

      if (!response.ok) {
        return null
      }

      return await response.json() as UserDto
    } catch (error) {
      return null
    }
  })

export const refreshTokens = createServerFn({ method: 'POST' })
  .validator((data: RefreshTokenRequest) => data)
  .handler(async ({ data }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        clearTokenCookies()
        throw new Error('Token refresh failed')
      }

      const authResult: AuthResponse = await response.json()
      
      // Update cookies with new tokens
      setSecureTokens(authResult.accessToken, authResult.refreshToken)
      
      return { success: true, user: authResult.user }
    } catch (error) {
      clearTokenCookies()
      throw new Error(error instanceof Error ? error.message : 'Token refresh failed')
    }
  })

export const logoutUser = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      const cookies = getHeader('Cookie') || ''
      const refreshToken = extractTokenFromCookies(cookies, 'refreshToken')
      
      if (refreshToken) {
        // Call backend logout to invalidate refresh token
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })
      }
      
      clearTokenCookies()
      return { success: true, message: 'Logged out successfully' }
    } catch (error) {
      // Always clear cookies even if backend call fails
      clearTokenCookies()
      return { success: true, message: 'Logged out successfully' }
    }
  })

export const changePassword = createServerFn({ method: 'POST' })
  .validator((data: ChangePasswordRequest) => data)
  .handler(async ({ data }) => {
    try {
      const { getHeader } = require('@tanstack/react-start/server')
      const cookies = getHeader('Cookie') || ''
      const accessToken = extractTokenFromCookies(cookies, 'accessToken')
      
      if (!accessToken) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Password change failed')
      }

      return await response.json() as OperationResult
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password change failed')
    }
  })

// Users API Functions
export const getUsers = createServerFn({ method: 'GET' })
  .validator(() => ({})) // No input validation needed for GET
  .handler(async () => {
    try {
      const cookies = getHeader('Cookie') || ''
      const accessToken = extractTokenFromCookies(cookies, 'accessToken')
      
      if (!accessToken) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${API_BASE_URL}/api/users?page=1&pageSize=10`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch users')
      }

      return await response.json() as GetUsersResponse
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch users')
    }
  })