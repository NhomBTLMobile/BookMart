import React from 'react';

import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '@/constants/colors';

type Props = {
  onPress?: () => void;
};

export default function BannerCard({
  onPress,
}: Props) {
  return (
    <ImageBackground
      source={require('../../assets/images/home-banner.png')}
      style={styles.banner}
      imageStyle={styles.image}
    >
      <View style={styles.content}>

        <Text style={styles.title}>
          Khám phá
          {'\n'}
          thế giới tri thức
        </Text>

        <Text style={styles.subtitle}>
          Sách hay cho mọi hành trình
          {'\n'}
          của bạn
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>
            Mua ngay →
          </Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 205,

    borderRadius: 18,

    overflow: 'hidden',

    marginBottom: 10,
  },

  image: {
    borderRadius: 18,
  },

  content: {
    flex: 1,

    padding: 20,

    width: '65%',
  },

  title: {
    fontSize: 23,

    fontWeight: '800',

    color: COLORS.text,

    lineHeight: 28,
  },

  subtitle: {
    fontSize: 13,

    color: COLORS.text,

    lineHeight: 19,

    marginTop: 8,
  },

  button: {
    alignSelf: 'flex-start',

    backgroundColor: COLORS.primary,

    paddingHorizontal: 18,

    paddingVertical: 9,

    borderRadius: 20,

    marginTop: 12,
  },

  buttonText: {
    color: COLORS.white,

    fontSize: 13,

    fontWeight: '700',
  },
});