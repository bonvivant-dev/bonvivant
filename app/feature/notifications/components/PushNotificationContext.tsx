import React, { createContext, useContext } from 'react'

import { usePushNotifications } from '../hooks/usePushNotifications'

interface PushNotificationContextType {
  expoPushToken: string
}

const PushNotificationContext = createContext<PushNotificationContextType>({
  expoPushToken: '',
})

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { expoPushToken } = usePushNotifications()

  return (
    <PushNotificationContext.Provider value={{ expoPushToken }}>
      {children}
    </PushNotificationContext.Provider>
  )
}

export function usePushNotificationContext() {
  return useContext(PushNotificationContext)
}
