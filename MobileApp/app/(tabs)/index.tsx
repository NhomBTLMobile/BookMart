import { useEffect, useRef, useState } from 'react';

import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import SectionHeader from '@/components/common/SectionHeader';
import BannerCard from '@/components/home/BannerCard';
import BookCard from '@/components/home/BookCard';
import CategoryCard from '@/components/home/CategoryCard';
import SearchBar from '@/components/home/SearchBar';

import { COLORS } from '@/constants/colors';

import { homeService } from '@/services/homeService';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen() {

  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [newBooks, setNewBooks] = useState<any[]>([]);
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Khách');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, bestsellersRes, categoriesRes] = await Promise.all([
          homeService.getFeaturedBooks(5),
          homeService.getNewBooks(5),
          homeService.getBestsellers(5),
          homeService.getCategories()
        ]);
        
        if (featuredRes.success) setFeaturedBooks(featuredRes.data);
        if (newRes.success) setNewBooks(newRes.data);
        if (bestsellersRes.success) setBestsellers(bestsellersRes.data);
        if (categoriesRes.success) setCategories(categoriesRes.data);
      } catch (error) {
        console.log('Error fetching home data', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchUser = async () => {
      const userStr = await SecureStore.getItemAsync('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.full_name || 'Bạn');
      }
    };
    fetchData();
    fetchUser();
  }, []);

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const getPlaceholderImage = (index: number) => {
    const placeholders = [
      require('../../assets/images/book1.jpg'),
      require('../../assets/images/book2.jpg'),
      require('../../assets/images/book3.jpg'),
      require('../../assets/images/book4.jpg'),
    ];
    return placeholders[index % placeholders.length];
  };

  // ── Fly-to-cart animation ─────────────────────────────────
  const cartIconRef  = useRef<View>(null);
  const flyX         = useRef(new Animated.Value(0)).current;
  const flyY         = useRef(new Animated.Value(0)).current;
  const flyScale     = useRef(new Animated.Value(1)).current;
  const flyOpacity   = useRef(new Animated.Value(0)).current;
  const [flyingBook, setFlyingBook] = useState<{
    source: any; width: number; height: number;
  } | null>(null);

  const addToCart = () => setCartCount(c => c + 1);

  /** Đo vị trí ảnh sách + cart icon rồi chạy animation bay */
  const triggerFlyToCart = (bookNode: View | null, imageSource: any) => {
    if (!bookNode || !cartIconRef.current) return;

    bookNode.measure((_bx, _by, bw, bh, bpx, bpy) => {
      (cartIconRef.current as View).measure((_cx, _cy, cw, ch, cpx, cpy) => {
        // Khởi tạo vị trí bắt đầu = vị trí ảnh sách trên màn hình
        flyX.setValue(bpx);
        flyY.setValue(bpy);
        flyScale.setValue(1);
        flyOpacity.setValue(1);
        setFlyingBook({ source: imageSource, width: bw, height: bh });

        // Điểm đích = trung tâm icon giỏ hàng
        const targetX = cpx + cw / 2 - bw / 2;
        const targetY = cpy + ch / 2 - bh / 2;

        Animated.parallel([
          Animated.timing(flyX, {
            toValue: targetX,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(flyY, {
            toValue: targetY,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(flyScale, {
            toValue: 0.12,
            duration: 900,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          // Fade out ở giai đoạn cuối
          Animated.sequence([
            Animated.delay(650),
            Animated.timing(flyOpacity, {
              toValue: 0,
              duration: 250,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => setFlyingBook(null));
      });
    });
  };
  // ─────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}
        <View style={styles.header}>

          <View>
            <Text style={styles.hello}>
              Xin chào,
            </Text>

            <Text style={styles.name}>
              {userName} 👋
            </Text>
          </View>

          {/* Icon chuông + giỏ hàng */}
          <View style={styles.headerIcons}>

            {/* Chuông thông báo */}
            <View style={styles.iconBtn}>
              <Ionicons
                name="notifications-outline"
                size={25}
                color={COLORS.text}
              />
              <View style={styles.notificationDot} />
            </View>

            {/* Cart icon với badge số lượng */}
            <TouchableOpacity
              ref={cartIconRef as any}
              style={styles.iconBtn}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <Ionicons name="cart-outline" size={24} color={COLORS.text} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

          </View>

        </View>


        {/* SEARCH */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
        />


        {/* BANNER */}
        <View style={styles.bannerSection}>
          <BannerCard
            onPress={() => {
              console.log('Mua ngay');
            }}
          />
        </View>

        {/* RECENTLY VIEWED (Zeigarnik Effect) */}
        <View style={styles.section}>
          <SectionHeader
            title="Sản phẩm xem gần đây"
            onPress={() => console.log('Xem tất cả')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {newBooks.map((book, index) => (
              <BookCard
                key={book.id}
                image={getPlaceholderImage(index + 2)}
                title={book.title}
                author={book.author?.name || 'Đang cập nhật'}
                price={formatPrice(book.sale_price)}
                rating={parseFloat(book.avg_rating) || 5.0}
                onPress={() => router.push(`/book/${book.id}`)}
                onAddToCart={addToCart}
                onCartPress={triggerFlyToCart}
              />
            ))}
          </ScrollView>
        </View>


        {/* CATEGORY */}
        <SectionHeader
          title="Danh mục"
          onPress={() => {
            console.log('Xem tất cả danh mục');
          }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.id || i}
              icon={cat.icon_url || 'book-outline'}
              title={cat.name}
            />
          ))}

        </ScrollView>

        {/* FLASH SALE (FOMO / Scarcity) */}
        <View style={styles.section}>
          <SectionHeader
            title="🔥 Giá sốc hôm nay"
            onPress={() => console.log('Xem tất cả')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredBooks.map((book, index) => (
              <BookCard
                key={book.id}
                image={getPlaceholderImage(index)}
                title={book.title}
                author={book.author?.name || 'Đang cập nhật'}
                price={formatPrice(book.sale_price)}
                rating={parseFloat(book.avg_rating) || 4.9}
                discount={`-${Math.round((1 - (book.sale_price / book.original_price)) * 100)}%`}
                onPress={() => router.push(`/book/${book.id}`)}
                onAddToCart={addToCart}
                onCartPress={triggerFlyToCart}
              />
            ))}
          </ScrollView>
        </View>


        {/* BOOKS NỔI BẬT */}
        <View style={styles.section}>
          <SectionHeader
            title="Sách nổi bật"
            onPress={() => console.log('Xem thêm sách')}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {bestsellers.map((book, index) => (
              <BookCard
                key={book.id}
                image={getPlaceholderImage(index + 1)}
                title={book.title}
                author={book.author?.name || 'Đang cập nhật'}
                price={formatPrice(book.sale_price)}
                rating={parseFloat(book.avg_rating) || 4.8}
                onPress={() => router.push(`/book/${book.id}`)}
                onAddToCart={addToCart}
                onCartPress={triggerFlyToCart}
              />
            ))}
          </ScrollView>
        </View>

        {/* RECOMMENDED (Cocktail Party Effect) */}
        <View style={styles.section}>
          <SectionHeader
            title={`Dành riêng cho ${userName}`}
            onPress={() => console.log('Xem thêm')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BookCard
              image={require('../../assets/images/book4.jpg')}
              title="Tuổi trẻ đáng giá bao nhiêu"
              author="Rosie Nguyễn"
              price="79.000đ"
              rating={4.8}
              onPress={() => router.push('/book/4')}
              onAddToCart={addToCart}
              onCartPress={triggerFlyToCart}
            />
            <BookCard
              image={require('../../assets/images/book3.jpg')}
              title="Tôi thấy hoa vàng trên cỏ xanh"
              author="Nguyễn Nhật Ánh"
              price="65.000đ"
              rating={4.7}
              onPress={() => router.push('/book/3')}
              onAddToCart={addToCart}
              onCartPress={triggerFlyToCart}
            />
          </ScrollView>
        </View>


        {/* FREE SHIPPING */}
        <View style={styles.shippingCard}>

          <View style={styles.shippingIcon}>
            <Ionicons name="car-outline" size={24} color={COLORS.primary} />
          </View>

          <View style={styles.shippingText}>
            <Text style={styles.shippingTitle}>
              Miễn phí vận chuyển
            </Text>
            <Text style={styles.shippingSubtitle}>
              Cho đơn hàng từ 200.000đ
            </Text>
          </View>

        </View>

      </ScrollView>

      {/* ── Ảnh sách đang bay về giỏ hàng ── */}
      {flyingBook && (
        <Animated.Image
          source={flyingBook.source}
          style={[
            styles.flyingImage,
            {
              width: flyingBook.width,
              height: flyingBook.height,
              opacity: flyOpacity,
              transform: [
                { translateX: flyX },
                { translateY: flyY },
                { scale: flyScale },
              ],
            },
          ]}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  hello: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  name: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },

  // Giữ style cũ để không vỡ bất kỳ ref nào
  notification: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },

  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },

  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },

  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },

  bannerSection: {
    marginTop: 18,
  },

  horizontalScroll: {
    marginBottom: 12,
  },

  section: {
    marginTop: 12,
  },

  shippingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 15,
    marginTop: 22,
  },

  shippingIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  shippingText: {
    marginLeft: 12,
  },

  shippingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },

  shippingSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  // ── Ảnh đang bay — overlay toàn màn hình ──
  flyingImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 8,
    zIndex: 9999,
  },

});
