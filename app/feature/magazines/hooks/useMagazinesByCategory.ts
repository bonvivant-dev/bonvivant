import { useState, useEffect } from 'react'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

export interface Category {
  id: string
  name: string
  magazines: Magazine[]
}

export interface MagazinesByCategory {
  categories: Category[]
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

      // Fetch magazines with category information
      const { data: magazines, error: magazinesError } = await supabase
        .from('magazines')
        .select(
          `
          *,
          categories (
            id,
            name
          )
        `
        )
        .order('created_at', { ascending: false })

      if (magazinesError) {
        throw magazinesError
      }

      // Fetch all categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (categoriesError) {
        throw categoriesError
      }

      // Group magazines by category
      const categoriesWithMagazines: Category[] = []

      // Initialize categories with empty magazines array
      categories?.forEach(category => {
        categoriesWithMagazines.push({
          id: category.id,
          name: category.name,
          magazines: [],
        })
      })

      // Distribute magazines to categories or uncategorized
      magazines?.forEach(magazine => {
        if (magazine.categories && magazine.category_id) {
          const categoryIndex = categoriesWithMagazines.findIndex(
            cat => cat.id === magazine.category_id
          )
          if (categoryIndex >= 0) {
            categoriesWithMagazines[categoryIndex].magazines.push(magazine)
          }
        }
      })

      // Filter out categories with no magazines
      const filteredCategories = categoriesWithMagazines.filter(
        category => category.magazines.length > 0
      )

      setMagazinesByCategory({
        categories: filteredCategories,
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
