import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
};

export default function CategoryCard({
  icon,
  title,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={26}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.title}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 75,

    alignItems: 'center',

    marginRight: 14,
  },

  iconContainer: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: COLORS.primaryLight,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 8,
  },

  title: {
    fontSize: 12,

    color: COLORS.text,

    textAlign: 'center',

    lineHeight: 16,
  },
});