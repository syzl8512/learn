export interface User {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  lexileLevel?: number
  readingTime?: number
  booksRead?: number
  vocabulariesCount?: number
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  nickname?: string
}