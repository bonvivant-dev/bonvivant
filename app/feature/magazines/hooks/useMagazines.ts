import { useState, useEffect } from 'react'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

export const useMagazines = () => {
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMagazines = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setMagazines(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (path: string) => {
    return supabase.storage.from('magazines').getPublicUrl(path).data.publicUrl
  }

  const getMagazineUrl = (path: string) => {
    return supabase.storage.from('magazines').getPublicUrl(path).data.publicUrl
  }

  useEffect(() => {
    fetchMagazines()
  }, [])

  return {
    magazines,
    loading,
    error,
    refetch: fetchMagazines,
    getImageUrl,
    getMagazineUrl,
  }
}
