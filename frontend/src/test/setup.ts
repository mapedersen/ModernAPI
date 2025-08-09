import '@testing-library/jest-dom'
import { beforeAll, vi } from 'vitest'

// Mock environment variables
beforeAll(() => {
  vi.stubEnv('API_BASE_URL', 'http://localhost:5000')
  vi.stubEnv('NODE_ENV', 'test')
})

// Global test utilities
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  displayName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  isEmailVerified: true,
  roles: ['User'],
}

export const mockAuthResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  user: mockUser,
}