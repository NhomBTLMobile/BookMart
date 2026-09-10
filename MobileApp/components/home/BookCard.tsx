import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type Props = {
    image: any;
    title: string;
    author: string;
    price: string;
    rating: number;
    onPress: () => void;
    onAddToCart: () => void;
}

export default function BookCard({ image, title, author, price, rating, onPress, onAddToCart}: Props){
    return(
        <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.85}
            onPress={onPress}>
            <Image source={image} style={styles.image} />
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            <Text style={styles.author} numberOfLines={1}>{author}</Text>
            <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#E5A72A" />
                <Text style={styles.rating}>{rating}</Text>
            </View>

            {/*Giá + card*/}
            <View style={styles.bottomRow}>
                <Text style={styles.price}>{price}</Text>
                <TouchableOpacity style={styles.cartButton} onPress={onAddToCart}>
                    <Ionicons name="cart-outline" size={18} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
} 

const styles = StyleSheet.create({
  card: {
    width: 165,

    backgroundColor: COLORS.surface,

    borderRadius: 14,

    padding: 10,

    marginRight: 12,
  },

  image: {
    width: '100%',
    height: 185,

    borderRadius: 8,

    resizeMode: 'cover',

    marginBottom: 10,
  },

  title: {
    fontSize: 15,

    fontWeight: '700',

    color: COLORS.text,

    lineHeight: 20,
  },

  author: {
    fontSize: 12,

    color: COLORS.textSecondary,

    marginTop: 4,
  },

  ratingContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 7,
  },

  rating: {
    fontSize: 12,

    color: COLORS.textSecondary,

    marginLeft: 4,
  },

  bottomRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginTop: 8,
  },

  price: {
    fontSize: 15,

    fontWeight: '800',

    color: COLORS.primaryDark,
  },

  cartButton: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',
  },
});