export interface Category {
  id: string
  name: string
  order: number
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
  category_orders?: { [categoryId: string]: number }
  created_at: string
  updated_at: string | null
  // IAP 관련
  product_id: string | null
  price: number | null
  is_purchasable: boolean
}

export interface PurchaseResult {
  success: boolean
  transactionId?: string
  error?: string
}