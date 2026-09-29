import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
}

export default function BookCard({
  image, title, author, price, rating, discount,
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
      style={styles.card}
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

      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color="#E5A72A" />
        <Text style={styles.rating}>{rating}</Text>
      </View>

      {/* Giá + nút thêm giỏ */}
      <View style={styles.bottomRow}>
        <Text style={styles.price}>{price}</Text>
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