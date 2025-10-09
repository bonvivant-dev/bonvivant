import { useLocalSearchParams } from 'expo-router'

import { MagazineFullViewer } from '@/feature/magazines/components'

export default function MagazineViewPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <MagazineFullViewer magazineId={id} />
}