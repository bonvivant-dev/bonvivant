import React from 'react'
import { Text as RNText, TextProps as RNTextProps } from 'react-native'

export interface TextProps extends RNTextProps {
  fontWeight?: 'regular' | 'medium' | 'semibold' | 'bold'
}

export function Text({ style, fontWeight = 'regular', ...props }: TextProps) {
  const fontFamilyMap = {
    regular: 'Pretendard',
    medium: 'Pretendard-Medium',
    semibold: 'Pretendard-SemiBold',
    bold: 'Pretendard-Bold',
  }

  return (
    <RNText
      {...props}
      style={[{ fontFamily: fontFamilyMap[fontWeight] }, style]}
    />
  )
}
