import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

type Props = {
  image: any;
  title: string;
  author: string;
  price: string;
  rating: number;
  onPress: () => void;
  onAddToCart: () => void;
  /** Callback nhận node của ảnh sách để đo vị trí và trigger fly animation */
  onCartPress?: (node: View | null, imageSource: any) => void;
  discount?: string;
  originalPrice?: string;
  isCombo?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function BookCard({
  image, title, author, price, rating, discount, originalPrice, isCombo, style,
  onPress, onAddToCart, onCartPress,
}: Props) {
  const imageWrapRef = useRef<View>(null);

  const handleAddToCart = () => {
    onAddToCart();
    if (onCartPress) {
      onCartPress(imageWrapRef.current, image);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Wrapper ref để đo vị trí ảnh */}
      <View ref={imageWrapRef} collapsable={false}>
        <Image source={image} style={styles.image} />
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.author} numberOfLines={1}>{author}</Text>

      {!isCombo && (
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={rating > 0 ? "#E5A72A" : COLORS.textHint} />
          <Text style={[styles.rating, rating === 0 && { color: COLORS.textHint }]}>
            {rating > 0 ? rating.toFixed(1) : 'Chưa có'}
          </Text>
        </View>
      )}

      {/* Giá + nút thêm giỏ */}
      <View style={styles.bottomRow}>
        <View style={styles.priceContainer}>
          {originalPrice && (
            <Text style={styles.originalPrice}>{originalPrice}</Text>
          )}
          <Text style={styles.price}>{price}</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
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

  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#E53935',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  discountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
    height: 40,
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

  priceContainer: {
    justifyContent: 'center',
  },

  originalPrice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginBottom: 2,
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