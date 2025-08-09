// User types matching backend DTOs
export interface UserDto {
  id: string
  email: string
  displayName: string
  firstName?: string
  lastName?: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface GetUsersResponse {
  users: UserDto[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateUserRequest {
  email: string
  displayName: string
  firstName?: string
  lastName?: string
}

export interface UpdateUserProfileRequest {
  displayName: string
  firstName?: string
  lastName?: string
}