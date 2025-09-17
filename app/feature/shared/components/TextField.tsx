import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps,
  View,
  TouchableOpacity,
} from 'react-native'

interface Props extends TextInputProps {
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
  const handleClear = () => {
    props.onChangeText('')
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, props.value ? styles.inputWithClear : null]}
        placeholder={props.placeholder}
        placeholderTextColor="#999"
        keyboardType={props.keyboardType}
        secureTextEntry={props.secureTextEntry}
        editable={props.editable}
        autoCapitalize={props.autoCapitalize}
        autoCorrect={props.autoCorrect}
        {...props}
      />
      {props.value && props.editable !== false && (
        <TouchableOpacity
          style={styles.clearButton}
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
  inputWithClear: {
    paddingRight: 45, // clear button을 위한 여유 공간
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }], // 아이콘 높이의 절반
    zIndex: 1,
  },
})
