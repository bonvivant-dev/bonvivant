import { Category } from '../category/types'

export interface Magazine {
  id: string
  title: string
  summary: string
  introduction: string
  storage_key: string
  cover_image: string | null
  preview_images: string[]
  season_id: string | null
  category_ids: string[]
  categories?: Category[]
  is_purchasable: boolean
  price: number | null
  product_id: string | null
  created_at: string
  updated_at: string | null
}


export interface MagazinesByCategory {
  categories: Array<{
    id: string
    name: string
    magazines: Magazine[]
  }>
  uncategorized: Magazine[]
}

export interface PDFPageImage {
  blob: Blob
  dataUrl: string
  pageNumber: number
}
