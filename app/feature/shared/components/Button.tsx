import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native'

import { Text } from './Text'

interface Props {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  textColor?: string
}

export function Button({
  children,
  loading,
  disabled,
  onPress,
  style,
  textColor = 'white',
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: '#007AFF',
          borderRadius: 8,
          opacity: pressed ? 0.8 : 1,
          width: '100%',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : typeof children === 'string' ? (
        <Text style={[styles.buttonText, { color: textColor }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
})
