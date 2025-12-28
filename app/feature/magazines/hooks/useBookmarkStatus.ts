import { useState, useEffect, useCallback } from 'react'

import { useAuth } from '@/feature/auth/components'
import { supabase } from '@/feature/shared/lib'

export function useBookmarkStatus(magazineId: string) {
  const { user } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkBookmarkStatus = useCallback(async () => {
    if (!user || !magazineId) {
      setIsBookmarked(false)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('magazine_id', magazineId)
        .maybeSingle()

      if (error) {
        throw error
      }

      setIsBookmarked(!!data)
    } catch (err) {
      console.error('북마크 상태 확인 실패:', err)
      setIsBookmarked(false)
    } finally {
      setLoading(false)
    }
  }, [user, magazineId])

  useEffect(() => {
    checkBookmarkStatus()
  }, [checkBookmarkStatus])

  return {
    isBookmarked,
    loading,
    refetch: checkBookmarkStatus,
  }
}
