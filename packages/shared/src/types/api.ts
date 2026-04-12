export interface ApiResponse<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
  readonly meta?: PaginationMeta
}

export interface PaginationMeta {
  readonly total: number
  readonly page: number
  readonly limit: number
}
