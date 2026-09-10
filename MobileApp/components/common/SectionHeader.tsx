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
  title: string;
  onPress?: () => void;
};

export default function SectionHeader({
  title,
  onPress,
}: Props) {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        {title}
      </Text>

      <TouchableOpacity
        onPress={onPress}
        style={styles.more}
      >
        <Text style={styles.text}>
          Xem thêm
        </Text>

        <Ionicons
          name="chevron-forward"
          size={17}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 14,
  },

  title: {
    fontSize: 21,

    fontWeight: '800',

    color: COLORS.text,
  },

  more: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  text: {
    fontSize: 13,

    color: COLORS.textSecondary,

    marginRight: 2,
  },
});