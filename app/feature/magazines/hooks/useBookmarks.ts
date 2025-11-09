import { useState, useEffect, useCallback } from 'react'

import { useAuth } from '@/feature/auth/components'
import { supabase } from '@/feature/shared'

import type { Magazine } from '../types'

export function useBookmarks() {
  const { user } = useAuth()
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookmarkedMagazines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 현재 로그인한 사용자 가져오기
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setMagazines([])
        setLoading(false)
        return
      }

      // bookmarks 테이블에서 해당 사용자의 북마크 조회
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('magazine_id, created_at')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (bookmarksError) {
        throw bookmarksError
      }

      if (!bookmarks || bookmarks.length === 0) {
        setMagazines([])
        setLoading(false)
        return
      }

      // 북마크한 매거진 ID 목록
      const magazineIds = bookmarks.map(b => b.magazine_id)

      // magazines 테이블에서 해당 매거진 정보 조회
      const { data: magazinesData, error: magazinesError } = await supabase
        .from('magazines')
        .select('*')
        .in('id', magazineIds)

      if (magazinesError) {
        throw magazinesError
      }

      // 북마크 생성 순서대로 정렬
      const sortedMagazines = (magazinesData || []).sort((a, b) => {
        const aBookmark = bookmarks.find(bm => bm.magazine_id === a.id)
        const bBookmark = bookmarks.find(bm => bm.magazine_id === b.id)
        if (!aBookmark || !bBookmark) return 0
        return (
          new Date(bBookmark.created_at).getTime() -
          new Date(aBookmark.created_at).getTime()
        )
      })

      setMagazines(sortedMagazines)
    } catch (err) {
      console.error('북마크한 매거진 조회 실패:', err)
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
      )
      setMagazines([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookmarkedMagazines()
  }, [fetchBookmarkedMagazines, user])

  return {
    magazines,
    loading,
    error,
    refetch: fetchBookmarkedMagazines,
  }
}
