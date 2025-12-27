import { View, StyleSheet, Image } from 'react-native'

interface LogoHeaderProps {
  children?: React.ReactNode
}

const LOGO_SIZE = 100

export function LogoHeader({ children }: LogoHeaderProps) {
  return (
    <View style={styles.header}>
      <Image
        source={require('@/assets/images/bonvivant.png')}
        style={styles.headerLogo}
        resizeMode="contain"
      />
      {children && <View style={styles.rightContent}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  headerLogo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
