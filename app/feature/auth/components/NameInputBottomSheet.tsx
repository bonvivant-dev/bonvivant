import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Keyboard,
  TouchableOpacity,
  TextInput,
} from 'react-native'

import { Button, Text } from '@/feature/shared'

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
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const inputRef = useRef<TextInput>(null)

  // variables
  const snapPoints = useMemo(() => {
    if (keyboardHeight > 0) {
      return ['70%']
    }
    return ['50%']
  }, [keyboardHeight])

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
      bottomSheetModalRef.current?.present()
    } else {
      bottomSheetModalRef.current?.dismiss()
    }
  }, [visible])

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height)
      }
    )
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0)
      }
    )

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  const handleSave = async () => {
    const currentName = name.trim()

    if (!currentName) {
      Alert.alert('오류', '이름을 입력해주세요.')
      return
    }
    if (currentName.length < 2) {
      Alert.alert('오류', '이름은 2글자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    try {
      console.log('Saving name:', currentName)
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: currentName,
        },
      })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Update successful:', data)

      // 세션 새로고침하여 UI 업데이트
      await supabase.auth.refreshSession()

      Alert.alert('성공', '닉네임이 변경되었습니다.')
      bottomSheetModalRef.current?.dismiss()
    } catch (error) {
      Alert.alert('오류', '이름 저장 중 오류가 발생했습니다.')
      console.error('Name update error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName('')
    bottomSheetModalRef.current?.dismiss()
  }

  if (!visible) {
    return null
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheet}
      handleIndicatorStyle={styles.indicator}
      keyboardBehavior="extend"
      enableDynamicSizing={false}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>닉네임을 입력해주세요</Text>
        </View>

        <View style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              defaultValue={username}
              onChangeText={setName}
              placeholder="이름 입력"
              placeholderTextColor="#999"
              maxLength={20}
              editable={!loading}
              autoFocus={true}
              style={[styles.input, name ? styles.inputWithClear : null]}
            />
            {name && !loading && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  inputRef.current?.clear()
                  setName('')
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={24} color="#000" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleCancel}
              disabled={loading}
              style={{ width: '50%', flex: 1, backgroundColor: '#F5F5F5' }}
              textColor="#000"
            >
              취소
            </Button>
            <Button
              onPress={handleSave}
              disabled={loading}
              style={{ width: '50%', flex: 1 }}
            >
              저장
            </Button>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
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
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 50,
    fontFamily: 'Pretendard',
  },
  inputWithClear: {
    paddingRight: 45,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
})
