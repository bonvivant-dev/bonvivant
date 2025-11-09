import { useState, useCallback } from 'react'

import { useAuth } from '@/feature/auth/components'
import { supabase } from '@/feature/shared'

export function useBookmarkToggle() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const toggleBookmark = useCallback(
    async (magazineId: string) => {
      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      setLoading(true)
      try {
        // 현재 북마크 상태 확인
        const { data: existingBookmark, error: checkError } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('magazine_id', magazineId)
          .maybeSingle()

        if (checkError) {
          throw checkError
        }

        if (existingBookmark) {
          // 북마크가 이미 있으면 삭제
          const { error: deleteError } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', existingBookmark.id)

          if (deleteError) {
            throw deleteError
          }

          return { isBookmarked: false }
        } else {
          // 북마크가 없으면 추가
          const { error: insertError } = await supabase
            .from('bookmarks')
            .insert({
              user_id: user.id,
              magazine_id: magazineId,
            })

          if (insertError) {
            throw insertError
          }

          return { isBookmarked: true }
        }
      } catch (err) {
        console.error('북마크 토글 실패:', err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  return {
    toggleBookmark,
    loading,
  }
}
