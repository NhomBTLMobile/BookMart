import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { homeService } from '@/services/homeService';
import { bookService } from '@/services/bookService';
import { useCart } from '@/context/CartContext';

export default function ComboDetailScreen() {
  const { id } = useLocalSearchParams();
  const [combo, setCombo] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCombo = async () => {
      try {
        const comboRes = await homeService.getComboDetails(id as string);
        if (comboRes.success && comboRes.data) {
          setCombo(comboRes.data);
          
          if (comboRes.data.books && comboRes.data.books.length > 0) {
            const bookPromises = comboRes.data.books.map((b: any) => bookService.getBookDetails(b.book_id));
            const booksResults = await Promise.all(bookPromises);
            
            const fetchedBooks = booksResults
              .map((res, idx) => ({
                ...res.data,
                combo_qty: comboRes.data.books[idx].quantity || 1
              }))
              .filter(b => b && b.id);
            setBooks(fetchedBooks);
          }
        }
      } catch (error) {
        console.log('Error fetching combo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombo();
  }, [id]);

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const handleAddToCart = () => {
    if (!combo) return;
    addToCart({
      id: combo.id,
      title: combo.name,
      author: 'Combo đặc biệt',
      price: combo.combo_price,
      originalPrice: combo.original_total,
      image: combo.cover_image_url ? { uri: combo.cover_image_url } : require('../../assets/images/book1.jpg'),
      quantity: 1,
      isCombo: true
    });
  };

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!combo) {
    return (
      <View style={styles.centerLoading}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.textSecondary} />
        <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>Không tìm thấy combo</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discountPercent = parseFloat(combo.original_total) > parseFloat(combo.combo_price)
    ? Math.round((1 - (parseFloat(combo.combo_price) / parseFloat(combo.original_total))) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết Combo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Image 
          source={combo.cover_image_url ? { uri: combo.cover_image_url } : require('../../assets/images/book1.jpg')} 
          style={styles.coverImage} 
        />
        
        <View style={styles.infoSection}>
          <Text style={styles.comboName}>{combo.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.comboPrice}>{formatPrice(combo.combo_price)}</Text>
            {discountPercent > 0 && (
              <>
                <Text style={styles.originalPrice}>{formatPrice(combo.original_total)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discountPercent}%</Text>
                </View>
              </>
            )}
          </View>
          
          <Text style={styles.stockText}>
            Còn lại: <Text style={{ fontWeight: 'bold' }}>{combo.stock_qty || 0}</Text> bộ
          </Text>
        </View>

        <View style={styles.booksSection}>
          <Text style={styles.sectionTitle}>Các sách trong Combo ({books.length})</Text>
          {books.map((book) => (
            <TouchableOpacity 
              key={book.id} 
              style={styles.bookRow}
              onPress={() => router.push(`/book/${book.id}`)}
            >
              <Image 
                source={book.images && book.images.length > 0 ? { uri: book.images[0].image_url } : require('../../assets/images/book1.jpg')} 
                style={styles.bookImage} 
              />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {book.authors && book.authors.length > 0 ? book.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật'}
                </Text>
                <View style={styles.bookQtyRow}>
                  <Text style={styles.bookPrice}>{formatPrice(book.sale_price)}</Text>
                  <Text style={styles.bookQty}>x{book.combo_qty}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={() => {
          handleAddToCart();
          router.push('/(tabs)/cart');
        }}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  coverImage: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
    backgroundColor: COLORS.surface,
  },
  infoSection: {
    padding: 20,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
  },
  comboName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 30,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  comboPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stockText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  booksSection: {
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  bookImage: {
    width: 70,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 15,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  bookAuthor: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  bookQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  bookQty: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 12,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  buyNowBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
