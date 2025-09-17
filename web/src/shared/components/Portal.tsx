'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: ReactNode
  isOpen: boolean
}

export function Portal({ children, isOpen }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !isOpen) {
    return null
  }

  return createPortal(children, document.body)
}
