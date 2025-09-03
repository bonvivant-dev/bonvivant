import BottomSheet, {
  BottomSheetView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native'

import { useAuth } from './AuthContext'

interface NameInputBottomSheetProps {
  visible: boolean
  onClose: () => void
  username: string
}

export function NameInputBottomSheet({
  visible,
  onClose,
  username,
}: NameInputBottomSheetProps) {
  const { supabase } = useAuth()
  const [name, setName] = useState(username)
  const [loading, setLoading] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null)

  // variables
  const snapPoints = useMemo(() => {
    return keyboardVisible ? ['75%'] : ['50%', '75%']
  }, [keyboardVisible])

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose()
      }
    },
    [onClose]
  )

  // effects
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.close()
    }
  }, [visible])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true)
        // 키보드가 올라오면 바텀시트를 더 높은 위치로
        bottomSheetRef.current?.snapToIndex(1)
      }
    )

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false)
      }
    )

    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [])

  const validateName = () => {
    if (!name.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.')
      return false
    }
    if (name.trim().length < 2) {
      Alert.alert('오류', '이름은 2글자 이상이어야 합니다.')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateName()) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
        },
      })

      if (error) throw error
      bottomSheetRef.current?.close()
    } catch (error) {
      Alert.alert('오류', '이름 저장 중 오류가 발생했습니다.')
      console.error('Name update error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName('')
    bottomSheetRef.current?.close()
  }

  if (!visible) {
    return null
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheet}
      handleIndicatorStyle={styles.indicator}
      keyboardBehavior="fillParent"
      enableDynamicSizing={false}
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.contentContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.header}>
            <Text style={styles.title}>닉네임을 입력해주세요</Text>
          </View>

          <View style={styles.content}>
            <BottomSheetTextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="이름 입력"
              maxLength={20}
              editable={!loading}
              autoFocus
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  indicator: {
    backgroundColor: '#DDD',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 30,
    backgroundColor: '#F9F9F9',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
