export interface Magazine {
  id: string
  title: string | null
  summary: string | null
  introduction: string | null
  storage_key: string
  cover_image: string | null
  preview_images: string[]
  season_id: string | null
  category_id: string | null
  created_at: string
  updated_at: string | null
}

export interface MagazineUploadResponse {
  success: boolean
  magazine: Magazine
  message: string
}

export interface MagazineListResponse {
  magazines: Magazine[]
  total: number
  page: number
  limit: number
  totalPages: number
}
