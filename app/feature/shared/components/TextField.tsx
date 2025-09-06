import React from 'react'
import {
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps,
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
  // autoComplete?: TextInputProps['autoComplete']
  // textContentType?: TextInputProps['textContentType']
}

export function TextField(props: Props) {
  return (
    <TextInput
      style={styles.input}
      placeholder={props.placeholder}
      placeholderTextColor="#999"
      keyboardType={props.keyboardType}
      secureTextEntry={props.secureTextEntry}
      editable={props.editable}
      autoCapitalize={props.autoCapitalize}
      autoCorrect={props.autoCorrect}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
})
