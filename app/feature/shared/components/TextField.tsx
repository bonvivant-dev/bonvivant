import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps as RNTextInputProps,
  View,
  TouchableOpacity,
} from 'react-native'

import { TextInput } from './TextInput'

interface Props extends RNTextInputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  keyboardType?: KeyboardTypeOptions
  secureTextEntry?: boolean
  editable?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  autoCorrect?: boolean
}

export function TextField(props: Props) {
  const [showPassword, setShowPassword] = useState(false)

  const handleClear = () => {
    props.onChangeText('')
  }

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  // secureTextEntry가 있을 때는 눈 아이콘, 없을 때는 clear 아이콘
  const showPasswordToggle = props.secureTextEntry
  const showClearButton = !props.secureTextEntry && props.value && props.editable !== false

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        style={[
          styles.input,
          (showPasswordToggle || showClearButton) && styles.inputWithIcon,
        ]}
        placeholder={props.placeholder}
        placeholderTextColor="#999"
        keyboardType={props.keyboardType}
        secureTextEntry={props.secureTextEntry && !showPassword}
        editable={props.editable}
        autoCapitalize={props.autoCapitalize}
        autoCorrect={props.autoCorrect}
      />
      {showPasswordToggle && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={togglePasswordVisibility}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      )}
      {showClearButton && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={24} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
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
  },
  inputWithIcon: {
    paddingRight: 45, // 아이콘을 위한 여유 공간
  },
  iconButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }], // 아이콘 높이의 절반
    zIndex: 1,
  },
})
