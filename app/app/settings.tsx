import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'

import { useAuth } from '@/feature/auth/components/AuthContext'
import { usePushNotificationContext } from '@/feature/notifications'
import { Text, PageHeader } from '@/feature/shared/components'
import { supabase } from '@/feature/shared/lib'

export default function SettingsScreen() {
  const { user } = useAuth()
  const { expoPushToken } = usePushNotificationContext()

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchNotificationSetting()
  }, [expoPushToken, user])

  async function fetchNotificationSetting() {
    if (!expoPushToken) {
      setLoading(false)
      return
    }

    try {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('notifications_enabled')
          .eq('id', user.id)
          .single()

        setNotificationsEnabled(data?.notifications_enabled ?? true)
      } else {
        const { data } = await supabase
          .from('push_tokens')
          .select('notifications_enabled')
          .eq('expo_push_token', expoPushToken)
          .maybeSingle()

        setNotificationsEnabled(data?.notifications_enabled ?? true)
      }
    } catch (error) {
      console.error('알림 설정 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(value: boolean) {
    setToggling(true)
    setNotificationsEnabled(value)

    try {
      if (user) {
        console.log(value, new Date().toISOString())
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            notifications_enabled: value,
            notifications_updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        console.log('profileError', profileError)

        if (profileError) throw profileError

        const { error: tokensError } = await supabase
          .from('push_tokens')
          .update({ notifications_enabled: value })
          .eq('user_id', user.id)

        if (tokensError) throw tokensError
      } else {
        const { error } = await supabase
          .from('push_tokens')
          .update({ notifications_enabled: value })
          .eq('expo_push_token', expoPushToken)

        if (error) throw error
      }
    } catch (error) {
      console.error('알림 설정 변경 에러:', error)
      setNotificationsEnabled(!value)
      Alert.alert('오류', '알림 설정 변경에 실패했습니다.')
    } finally {
      setToggling(false)
    }
  }

  const hasToken = !!expoPushToken

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title="설정" />
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : hasToken ? (
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={24} color="#333" />
                <Text style={styles.settingLabel}>알림 수신</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggle}
                disabled={toggling}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                thumbColor="#FFF"
              />
            </View>
          ) : (
            <View style={styles.noPermissionContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={40}
                color="#999"
              />
              <Text style={styles.noPermissionText}>
                알림 권한이 없습니다.{'\n'}기기 설정에서 알림을 허용해주세요.
              </Text>
              <View style={styles.openSettingsButton}>
                <Text
                  style={styles.openSettingsText}
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                      Linking.openURL('app-settings:')
                    } else {
                      Linking.openSettings()
                    }
                  }}
                >
                  설정으로 이동
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  noPermissionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  noPermissionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  openSettingsButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  openSettingsText: {
    fontSize: 14,
    color: '#FFF',
  },
})
