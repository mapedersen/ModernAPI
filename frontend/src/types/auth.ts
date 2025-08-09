// Authentication types matching backend DTOs
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  displayName: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
  user: UserDto
}

export interface UserDto {
  id: string
  email: string
  displayName: string
  firstName?: string
  lastName?: string
  isEmailVerified: boolean
  roles: string[]
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface LogoutRequest {
  refreshToken: string
}

export interface LogoutResponse {
  message: string
}

export interface TokenValidationRequest {
  refreshToken: string
}

export interface TokenValidationResponse {
  isValid: boolean
}

export interface OperationResult {
  success: boolean
  message?: string
  errors?: string[]
}