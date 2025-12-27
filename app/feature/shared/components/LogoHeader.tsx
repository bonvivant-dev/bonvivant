import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'

import { UserProfileBottomSheet } from '@/feature/auth/components'

interface LogoHeaderProps {
  showUserIcon?: boolean
}

const LOGO_SIZE = 100

export function LogoHeader({ showUserIcon = true }: LogoHeaderProps) {
  const [showProfileSheet, setShowProfileSheet] = useState(false)

  return (
    <>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/bonvivant.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        {showUserIcon && (
          <TouchableOpacity
            style={styles.userIconButton}
            onPress={() => setShowProfileSheet(prev => !prev)}
          >
            <Ionicons name="person-circle-outline" size={32} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      <UserProfileBottomSheet
        visible={showProfileSheet}
        onClose={() => setShowProfileSheet(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingRight: 16,
    backgroundColor: '#fff',
  },
  headerLogo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  userIconButton: {
    padding: 4,
  },
})
