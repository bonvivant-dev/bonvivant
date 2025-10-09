export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string | null
}

export interface Magazine {
  id: string
  title: string
  summary: string | null
  introduction: string | null
  storage_key: string
  cover_image: string | null
  preview_images: string[] | null
  season_id: string | null
  category_ids: string[]
  categories?: Category[]
  created_at: string
  updated_at: string | null
}