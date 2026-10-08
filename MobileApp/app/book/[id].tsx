import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import BookCard from '../../components/home/BookCard';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// ─── Tiny utility ───────────────────────────────────────────────────────────
const Divider = () => <View style={styles.divider} />;

const RATING_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Rất tốt', 'Tuyệt vời!'];

import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { useCart } from '../../context/CartContext';
import { bookService } from '../../services/bookService';
import { homeService } from '../../services/homeService';
import { wishlistService } from '../../services/wishlistService';

// ─── Component chính ─────────────────────────────────────────────────────────
export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [similarBooks, setSimilarBooks] = useState<any[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [ratingCounts, setRatingCounts] = useState<any>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0 });

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const [bookRes, vouchersRes, reviewsRes, similarRes] = await Promise.all([
          bookService.getBookDetails(id as string),
          homeService.getVouchers(),
          bookService.getBookReviews(id as string, 10),
          bookService.getSimilarBooks(id as string, 10)
        ]);
        
        if (bookRes.success && bookRes.data) {
          setBook(bookRes.data);
        }
        
        if (vouchersRes.success && vouchersRes.data) {
          setVouchers(vouchersRes.data);
        }

        // Check if book is in wishlist
        try {
          const wlRes = await wishlistService.getMyWishlist();
          if (wlRes.success && wlRes.data) {
            const isFav = wlRes.data.some((b: any) => String(b.id) === String(id));
            setIsFavorite(isFav);
          }
        } catch (e) {
          // ignore
        }
        
        if (reviewsRes.success && reviewsRes.data) {
          setReviews(reviewsRes.data);
          setTotalReviews(reviewsRes.meta?.total || reviewsRes.data.length);
          const counts: any = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: reviewsRes.data.length };
          reviewsRes.data.forEach((r: any) => {
            if (counts[r.rating] !== undefined) counts[r.rating]++;
          });
          setRatingCounts(counts);
        }

        if (similarRes.success && similarRes.data) {
          setSimilarBooks(similarRes.data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // Hiệu ứng nhấn yêu thích (Scale animation – Feedback tức thì)
  const heartScale = useRef(new Animated.Value(1)).current;
  const handleFavorite = async () => {
    setIsFavorite(v => !v);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    
    // Call API
    try {
      const res = await wishlistService.toggleWishlist(book.id);
      if (res && res.success === false) {
        // rollback if failed
        setIsFavorite(v => !v);
      }
    } catch (e) {
      // rollback if failed
      setIsFavorite(v => !v);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.text }}>Không tìm thấy sách</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 10, backgroundColor: COLORS.primary, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formatPrice = (price: any) => {
    if (!price) return '0đ';
    const num = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const coverImage = book.images && book.images.length > 0 
    ? { uri: book.images[0].image_url } 
    : require('../../assets/images/book1.jpg');
    
  const authorName = book.authors && book.authors.length > 0 
    ? book.authors.map((a: any) => a.name).join(', ') 
    : 'Đang cập nhật';
    
  const publisherName = book.publisher?.name || 'Đang cập nhật';
  const salePrice = formatPrice(book.sale_price);
  const originalPrice = formatPrice(book.original_price);
  const discount = book.original_price > book.sale_price 
    ? `-${Math.round((1 - (book.sale_price / book.original_price)) * 100)}%` 
    : null;

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'soft_cover': return 'Bìa mềm';
      case 'hard_cover': return 'Bìa cứng';
      case 'board_book': return 'Sách bìa bồi';
      case 'audio_book': return 'Sách nói';
      case 'e_book': return 'Sách điện tử';
      default: return format || 'Bìa mềm';
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="share-social-outline" size={21} color={COLORS.text} />
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity style={styles.circleBtn} onPress={handleFavorite}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? '#E53935' : COLORS.text}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── 1. HERO BOOK COVER (2D Book Mockup – stable cross-platform) ── */}
        {/*
          Kỹ thuật: rotate(-3deg) 2D + gáy sách thật + trang sách + bóng ellipse
          → Hiệu ứng 3D giả mà không dùng rotateY/perspective dễ crash Android.
        */}
        <View style={styles.heroSection}>
          {/* Nền màu thương hiệu với vòng tròn trang trí (Depth cue) */}
          <View style={styles.heroBg} />
          <View style={styles.heroBgCircle1} />
          <View style={styles.heroBgCircle2} />

          {/* Khối sách tổng thể, nghiêng nhẹ bằng rotate 2D */}
          <View style={styles.bookStage}>

            {/* Bóng đổ dạng ellipse phía dưới – nổi trên bề mặt */}
            <View style={styles.bookShadowEllipse} />

            {/* Cụm sách: gáy + bìa + trang */}
            <View style={styles.bookGroup}>

              {/* Trang sách bên phải (page edges) */}
              <View style={styles.pageEdgesRight}>
                <View style={[styles.pageLine, { backgroundColor: '#E8E0D0' }]} />
                <View style={[styles.pageLine, { backgroundColor: '#F0EAE0', marginLeft: 2 }]} />
                <View style={[styles.pageLine, { backgroundColor: '#F5F0EA', marginLeft: 4 }]} />
              </View>

              {/* Bìa chính */}
              <View style={styles.bookCoverWrapper}>
                <Image
                  source={coverImage}
                  style={styles.bookCover}
                  contentFit="cover"
                  transition={400}
                />
                {/* Vệt sáng (shine) trên bìa – chất giấy bóng */}
                <View style={styles.bookShine} pointerEvents="none" />
              </View>

              {/* Gáy sách bên trái */}
              <View style={styles.bookSpine}>
                <View style={styles.spineHighlight} />
              </View>
            </View>
          </View>
        </View>

        {/* ── 2. GIÁ + SOCIAL PROOF ─────────────────────────────
          Anchoring Effect: Giá gốc lớn trước → giá sale trông hấp dẫn hơn
          Social Proof: Số lượng đã bán + lượt đánh giá
        */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.salePrice}>{salePrice}</Text>
            <Text style={styles.originalPrice}>{originalPrice}</Text>
            {discount && (
              <View style={styles.discountPill}>
                <Text style={styles.discountText}>{discount}</Text>
              </View>
            )}
          </View>

          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>
            bởi <Text style={styles.authorLink}>{authorName}</Text>
          </Text>

          {/* Social proof bar */}
          <View style={styles.socialBar}>
            <View style={styles.socialItem}>
              <Ionicons name="star" size={15} color="#E5A72A" />
              <Text style={styles.socialText}>{book.avg_rating ? Number(book.avg_rating).toFixed(1) : '5.0'}</Text>
              <Text style={styles.socialSub}> ({totalReviews})</Text>
            </View>
            <View style={styles.socialDot} />
            <View style={styles.socialItem}>
              <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} />
              <Text style={styles.socialText}> Đã bán {book.sold_count || 0}</Text>
            </View>
            {(book.stock_qty || 0) <= 10 && (
              <>
                <View style={styles.socialDot} />
                {/* Scarcity Effect – chỉ còn ít – thúc đẩy hành động */}
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>🔥 Còn {book.stock_qty || 0} cuốn</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <Divider />

        {/* ── 3. VOUCHER ────────────────────────────────────────── */}
        {vouchers.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ưu đãi dành cho bạn</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                {vouchers.map((v, i) => (
                  <TouchableOpacity key={v.id || i} style={styles.voucherChip} activeOpacity={0.8}>
                    <Ionicons name={v.type === 'shipping' ? 'car-outline' : 'ticket-outline'} size={15} color={COLORS.primaryDark} />
                    <Text style={styles.voucherLabel}>
                      {v.type === 'shipping' ? 'Freeship' : `Giảm ${formatPrice(v.value)}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Divider />
          </>
        )}

        {/* ── 4. CHI TIẾT SÁCH ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết sách</Text>
          <View style={styles.specsGrid}>
            {[
              ['Tác giả', authorName],
              ['Nhà xuất bản', publisherName],
              ['Kích thước', `${book.length_cm || 0}x${book.width_cm || 0} cm`],
              ['Hình thức', getFormatLabel(book.format)],
              ['Khối lượng', `${book.weight_grams || 0} g`],
            ].map(([label, value]) => (
              <View key={label} style={styles.specRow}>
                <Text style={styles.specLabel}>{label}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {/* ── 5. MÔ TẢ ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Về cuốn sách này</Text>
          <Text style={styles.descText}>{book.description || 'Chưa có mô tả.'}</Text>
        </View>

        <Divider />

        {/* ── 6. ĐÁNH GIÁ ─────────────────────────────────────────
          Social Proof + Reciprocity: Hiển thị đánh giá thực → tạo uy tín.
        */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Đánh giá & Nhận xét</Text>
          </View>

          {/* Tóm tắt điểm đánh giá */}
          <View style={styles.ratingOverview}>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingBigNum}>{book.avg_rating ? Number(book.avg_rating).toFixed(1) : '5.0'}</Text>
              <Text style={styles.ratingBigStar}>★</Text>
            </View>
            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map(s => {
                const pct = ratingCounts.total > 0 ? (ratingCounts[s] / ratingCounts.total) * 100 : (s === 5 ? 100 : 0);
                return (
                  <View key={s} style={styles.ratingBarRow}>
                    <Text style={styles.ratingBarLabel}>{s}</Text>
                    <View style={styles.ratingBarTrack}>
                      <View style={[styles.ratingBarFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Review cards */}
          {reviews.map((rv, i) => (
            <View key={rv.id || i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                {rv.user_avatar_url ? (
                  <Image source={{ uri: rv.user_avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                    <Text style={styles.avatarText}>{(rv.user_name || 'U').charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.reviewerName}>{rv.user_name || 'Người dùng'}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 2 }}>
                    {Array.from({ length: rv.rating || 5 }).map((_, si) => (
                      <Ionicons key={si} name="star" size={12} color="#E5A72A" />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{new Date(rv.created_at).toLocaleDateString('vi-VN')}</Text>
              </View>
              <Text style={styles.reviewText}>{rv.body}</Text>
            </View>
          ))}
          {reviews.length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 15, color: COLORS.textSecondary }}>
              Chưa có đánh giá nào cho cuốn sách này.
            </Text>
          )}

          {reviews.length > 0 && (
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push(`/reviews?bookId=${id}`)}>
              <Text style={styles.seeAllText}>Xem tất cả {totalReviews} đánh giá</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primaryDark} />
            </TouchableOpacity>
          )}
        </View>

        <Divider />

        {/* ── 7. GỢI Ý SẢN PHẨM ───────────────────────────────────
          Mere Exposure Effect: Thấy nhiều sản phẩm → quen → muốn mua thêm
        */}
        {similarBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sách tương tự dành cho bạn</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
              {similarBooks.map((simBook: any) => (
                <BookCard 
                  key={simBook.id}
                  image={{ uri: simBook.images?.[0]?.image_url || 'https://via.placeholder.com/150' }}
                  title={simBook.title}
                  author={simBook.authors?.map((a: any) => a.name).join(', ') || 'Đang cập nhật'}
                  price={`${new Intl.NumberFormat('vi-VN').format(simBook.sale_price)}đ`}
                  rating={simBook.avg_rating ? Number(simBook.avg_rating) : 5}
                  onPress={() => router.push(`/book/${simBook.id}`)}
                  onAddToCart={() => {
                    addToCart({
                      id: simBook.id,
                      title: simBook.title,
                      author: simBook.authors?.map((a: any) => a.name).join(', ') || 'Đang cập nhật',
                      price: simBook.sale_price,
                      originalPrice: simBook.original_price,
                      image: { uri: simBook.images?.[0]?.image_url || 'https://via.placeholder.com/150' },
                      quantity: 1
                    });
                    Alert.alert('Thành công', 'Đã thêm sách vào giỏ hàng');
                  }} 
                />
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>

      {/* ── FLOATING BOTTOM BAR ───────────────────────────────────
        Fitts's Law: CTA to, chiếm vùng ngón cái dễ với.
        Von Restorff Effect: Nút "Mua ngay" màu đậm nổi bật tuyệt đối.
      */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.85} onPress={() => {
          addToCart({
            id: book.id,
            title: book.title,
            author: authorName,
            price: book.sale_price,
            originalPrice: book.original_price,
            image: coverImage,
            quantity: 1
          });
          Alert.alert('Thành công', 'Đã thêm sách vào giỏ hàng');
        }}>
          <Ionicons name="cart-outline" size={24} color={COLORS.text} />
          <Text style={styles.cartBtnText}>Giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyBtn}
          activeOpacity={0.85}
          onPress={() => {
            const buyNowItem = {
              id: book.id,
              title: book.title,
              author: authorName,
              price: book.sale_price,
              originalPrice: book.original_price,
              image: coverImage,
              quantity: 1
            };
            router.push({ pathname: '/checkout', params: { items: JSON.stringify([buyNowItem]) } });
          }}
        >
          <Text style={styles.buyBtnText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  divider: { height: 8, backgroundColor: '#F2F4F3', marginVertical: 2 },
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 18,
    paddingBottom: 10,
  },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },

  // ── HERO / BOOK COVER (2D mockup – cross-platform safe) ──────────────────
  heroSection: {
    width: '100%',
    height: width * 1.0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingBottom: 24,
  },
  heroBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.primaryLight,
  },
  // Hai vòng tròn trang trí tạo chiều sâu (Depth cue)
  heroBgCircle1: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(62,155,79,0.08)',
    top: -width * 0.15,
    right: -width * 0.2,
  },
  heroBgCircle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(35,107,50,0.06)',
    bottom: -width * 0.1,
    left: -width * 0.1,
  },

  // Sân khấu cho sách – nghiêng nhẹ 2D (KHÔNG dùng rotateY)
  bookStage: {
    alignItems: 'center',
    // Nghiêng toàn khối 3° – ổn định tuyệt đối trên cả Android & iOS
    transform: [{ rotate: '-3deg' }],
  },

  // Bóng ellipse phía dưới sách
  bookShadowEllipse: {
    width: width * 0.52,
    height: 20,
    borderRadius: width * 0.26,
    backgroundColor: 'rgba(35,107,50,0.22)',
    marginBottom: -10,
    alignSelf: 'center',
    // Bóng mở rộng sang hai bên
    transform: [{ scaleX: 1.1 }],
  },

  // Cụm sách (gáy + bìa + trang)
  bookGroup: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  // Gáy sách – nằm bên TRÁI bìa
  bookSpine: {
    width: 18,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: COLORS.primaryDark,
    overflow: 'hidden',
  },
  // Vệt sáng dọc trên gáy
  spineHighlight: {
    position: 'absolute',
    top: 0, right: 0,
    width: 4,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // Bìa sách chính
  bookCoverWrapper: {
    width: width * 0.52,
    height: width * 0.76,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
    // Đổ bóng cạnh phải (tạo chiều sâu giả)
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 14,
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  // Vệt sáng trên bìa → chất giấy bóng cao cấp
  bookShine: {
    position: 'absolute',
    top: 0, left: 0,
    width: '30%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  // Trang sách bên phải bìa (page edges)
  pageEdgesRight: {
    position: 'absolute',
    right: -10,
    top: 4,
    bottom: 4,
    width: 12,
    overflow: 'hidden',
  },
  pageLine: {
    position: 'absolute',
    top: 0, bottom: 0,
    left: 0,
    width: '100%',
  },

  // Price & Info
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  salePrice: { fontSize: 30, fontWeight: '800', color: COLORS.primaryDark, letterSpacing: -1 },
  originalPrice: {
    fontSize: 16, color: COLORS.textSecondary,
    textDecorationLine: 'line-through', marginLeft: 12,
  },
  discountPill: {
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8, marginLeft: 10,
  },
  discountText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '800' },

  bookTitle: {
    fontSize: 22, fontWeight: '800', color: COLORS.text,
    lineHeight: 30, letterSpacing: -0.4,
  },
  bookAuthor: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  authorLink: { color: COLORS.primaryDark, fontWeight: '700' },

  socialBar: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 14, flexWrap: 'wrap', gap: 6,
  },
  socialItem: { flexDirection: 'row', alignItems: 'center' },
  socialText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  socialSub: { fontSize: 13, color: COLORS.textSecondary },
  socialDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: COLORS.textSecondary, marginHorizontal: 6,
  },
  stockBadge: {
    backgroundColor: '#FFF3E0', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  stockText: { fontSize: 12, color: '#E65100', fontWeight: '700' },

  // Voucher
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  voucherChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 22, marginRight: 10,
    borderWidth: 1, borderColor: '#C5E1A5',
  },
  voucherLabel: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '700', marginLeft: 6 },

  // Specs
  specsGrid: { marginTop: 14 },
  specRow: {
    flexDirection: 'row', paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  specLabel: { flex: 0.4, fontSize: 14, color: COLORS.textSecondary },
  specValue: { flex: 0.6, fontSize: 14, color: COLORS.text, fontWeight: '600' },

  // Description
  descText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 26, marginTop: 12 },

  // Reviews
  ratingOverview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7FAF7',
    borderRadius: 16, padding: 16, marginTop: 16,
  },
  ratingBig: { alignItems: 'center', marginRight: 20 },
  ratingBigNum: { fontSize: 44, fontWeight: '800', color: COLORS.primaryDark, lineHeight: 50 },
  ratingBigStar: { fontSize: 24, color: '#E5A72A' },
  ratingBars: { flex: 1 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingBarLabel: { fontSize: 12, color: COLORS.textSecondary, width: 14, textAlign: 'right', marginRight: 8 },
  ratingBarTrack: {
    flex: 1, height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden',
  },
  ratingBarFill: { height: '100%', backgroundColor: '#E5A72A', borderRadius: 3 },

  reviewCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  reviewDate: { fontSize: 12, color: COLORS.textSecondary },
  reviewText: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginTop: 10 },

  seeAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, marginTop: 6,
  },
  seeAllText: { color: COLORS.primaryDark, fontSize: 14, fontWeight: '600', marginRight: 4 },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16, paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: 12,
  },
  cartBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 52, borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5, borderColor: COLORS.primary,
    gap: 6,
  },
  cartBtnText: { color: COLORS.primaryDark, fontSize: 15, fontWeight: '700' },
  buyBtn: {
    flex: 1.6, height: 52, borderRadius: 14,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  buyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  modalSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, marginBottom: 20 },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  ratingLabel: { textAlign: 'center', color: '#E5A72A', fontWeight: '700', fontSize: 16, marginBottom: 20 },
  reviewInput: {
    backgroundColor: '#F5F7F5', borderRadius: 14,
    padding: 14, fontSize: 15, color: COLORS.text, minHeight: 120,
    borderWidth: 1, borderColor: COLORS.border,
  },
  submitBtn: {
    backgroundColor: COLORS.primaryDark, borderRadius: 16,
    height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 18,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
