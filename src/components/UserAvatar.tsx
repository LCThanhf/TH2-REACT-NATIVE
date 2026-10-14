import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { UserRound } from 'lucide-react-native';

interface UserAvatarProps {
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  style?: ViewStyle;
}

/**
 * Avatar mặc định thay cho ảnh thật.
 * Mô phỏng ảnh mẫu: nền tròn xám-xanh nhạt + icon người xanh-ghi.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 52,
  backgroundColor = '#d3dcdf',
  iconColor = '#7d9da9',
  style,
}) => {
  const iconSize = Math.round(size * 0.58);

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <UserRound size={iconSize} color={iconColor} strokeWidth={1.8} />
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
