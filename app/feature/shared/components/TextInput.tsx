import React from 'react'
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from 'react-native'

export interface TextInputProps extends RNTextInputProps {
  fontWeight?: 'regular' | 'medium' | 'semibold' | 'bold'
}

export function TextInput({
  style,
  fontWeight = 'regular',
  ...props
}: TextInputProps) {
  const fontFamilyMap = {
    regular: 'Pretendard',
    medium: 'Pretendard-Medium',
    semibold: 'Pretendard-SemiBold',
    bold: 'Pretendard-Bold',
  }

  return (
    <RNTextInput
      {...props}
      style={[{ fontFamily: fontFamilyMap[fontWeight] }, style]}
    />
  )
}
