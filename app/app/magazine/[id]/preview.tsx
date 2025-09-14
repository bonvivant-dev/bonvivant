import { useLocalSearchParams } from 'expo-router'
import React from 'react'

import { MagazinePreviewer } from '@/feature/magazines'

export default function MagazinePreviewPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <MagazinePreviewer magazineId={id} />
}
