import { useState, useEffect } from 'react'

import { supabase } from '@/feature/shared/lib'

import { Magazine, Category } from '../types'

export interface MagazinesByCategory {
  categories: (Category & { magazines: Magazine[] })[]
}

export const useMagazinesByCategory = () => {
  const [magazinesByCategory, setMagazinesByCategory] =
    useState<MagazinesByCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMagazinesByCategory = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all categories (ordered by order field)
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, order, created_at, updated_at')
        .order('order', { ascending: true })

      if (categoriesError) {
        throw categoriesError
      }

      // Fetch magazines with category relationships
      const { data: magazines, error: magazinesError } = await supabase
        .from('magazines')
        .select(
          `
          *,
          magazine_categories (
            category_id,
            order,
            categories (
              id,
              name
            )
          )
        `
        )
        .eq('is_purchasable', true)
        .order('created_at', { ascending: false })

      if (magazinesError) {
        throw magazinesError
      }

      // Process magazines to include category_ids, categories and order information
      const processedMagazines = (magazines || []).map(magazine => {
        // 카테고리별 order를 매핑으로 저장
        const categoryOrders: { [categoryId: string]: number } = {}
        magazine.magazine_categories?.forEach((mc: any) => {
          if (mc.category_id) {
            categoryOrders[mc.category_id] = mc.order ?? 0
          }
        })

        return {
          ...magazine,
          category_ids:
            magazine.magazine_categories?.map((mc: any) => mc.category_id) ||
            [],
          categories:
            magazine.magazine_categories
              ?.map((mc: any) => mc.categories)
              .filter(Boolean) || [],
          category_orders: categoryOrders,
        }
      })

      // Group magazines by category
      const categoriesWithMagazines: (Category & { magazines: Magazine[] })[] =
        []

      // Initialize categories and add magazines
      categories.forEach(category => {
        const categoryMagazines = processedMagazines
          .filter(magazine => magazine.category_ids.includes(category.id))
          .sort((a, b) => {
            const orderA = a.category_orders[category.id] ?? 0
            const orderB = b.category_orders[category.id] ?? 0
            return orderA - orderB
          })

        if (categoryMagazines.length > 0) {
          categoriesWithMagazines.push({
            id: category.id,
            name: category.name,
            order: category.order,
            created_at: category.created_at || '',
            updated_at: category.updated_at || null,
            magazines: categoryMagazines,
          })
        }
      })

      setMagazinesByCategory({
        categories: categoriesWithMagazines,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMagazinesByCategory()
  }, [])

  return {
    magazinesByCategory,
    loading,
    error,
    refetch: fetchMagazinesByCategory,
  }
}
