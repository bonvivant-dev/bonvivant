import { ActivityIndicator, ActivityIndicatorProps } from 'react-native'

export function Spinner({ color = '#FFF', ...props }: ActivityIndicatorProps) {
  return <ActivityIndicator size="small" color={color} {...props} />
}
