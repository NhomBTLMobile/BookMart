import React from 'react';

import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({
  value,
  onChangeText,
}: Props) {
  return (
    <View style={styles.container}>

      <Ionicons
        name="search-outline"
        size={21}
        color={COLORS.textSecondary}
      />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Tìm sách, tác giả, thể loại..."
        placeholderTextColor={COLORS.textSecondary}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.surface,

    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: 25,

    paddingHorizontal: 16,
  },

  input: {
    flex: 1,

    marginLeft: 10,

    fontSize: 14,

    color: COLORS.text,
  },
});