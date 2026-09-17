// SocialButton — Social Proof: Google logo quen thuộc tăng độ tin tưởng
// Border thay gradient để không cạnh tranh thị giác với PrimaryButton

import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants/colors';

type Props = {
  title: string;
  onPress: () => void;
};

export default function SocialButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.82}
      onPress={onPress}
    >
      <Image
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png' }}
        style={styles.icon}
        contentFit="contain"
      />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 10,
    // Light shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  icon: {
    width: 20,
    height: 20,
  },
  text: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
});
