import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { Animated, StyleSheet, View } from 'react-native'

import { Text } from './Text'

interface ToastContextType {
  show: (message: string) => void
}

const ToastContext = createContext<ToastContextType>({
  show: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current
  const [message, setMessage] = useState('')

  const show = useCallback(
    (text: string) => {
      setMessage(text)
      opacity.setValue(0)
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setMessage(''))
    },
    [opacity]
  )

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message ? (
        <Animated.View
          style={[styles.container, { opacity }]}
          pointerEvents="none"
        >
          <View style={styles.box}>
            <Text style={styles.text}>{message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  box: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
  },
})
