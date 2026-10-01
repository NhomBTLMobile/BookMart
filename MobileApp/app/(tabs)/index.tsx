import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
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
import { useCart } from '@/context/CartContext';

export default function HomeScreen() {

  const [search, setSearch] = useState('');
  const { cartCount, addToCart: addContextCart } = useCart();

  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [newBooks, setNewBooks] = useState<any[]>([]);
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // States for infinite scrolling
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Khách');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, bestsellersRes, categoriesRes, allBooksRes] = await Promise.all([
          homeService.getFeaturedBooks(5),
          homeService.getNewBooks(5),
          homeService.getBestsellers(5),
          homeService.getCategories(),
          homeService.getAllBooks(1, 6)
        ]);
        
        if (featuredRes.success) setFeaturedBooks(featuredRes.data);
        if (newRes.success) setNewBooks(newRes.data);
        if (bestsellersRes.success) setBestsellers(bestsellersRes.data);
        if (categoriesRes.success) setCategories(categoriesRes.data);
        if (allBooksRes.success) {
          setAllBooks(allBooksRes.data);
          if (allBooksRes.data.length < 6) setHasMore(false);
        }
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
        setUserAvatar(user.avatar_url || null);
      }
    };
    fetchData();
    fetchUser();
  }, []);

  const loadMoreBooks = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await homeService.getAllBooks(nextPage, 6);
      if (res.success && res.data.length > 0) {
        setAllBooks(prev => [...prev, ...res.data]);
        setPage(nextPage);
        if (res.data.length < 6) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log('Error loading more books', error);
    } finally {
      setLoadingMore(false);
    }
  };

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

  const getImageSource = (book: any, index: number) => {
    return book.images && book.images.length > 0 ? { uri: book.images[0].image_url } : getPlaceholderImage(index);
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

  // We map the addToCart from context instead
  // const addToCart = () => setCartCount(c => c + 1);

  const triggerFlyToCart = (bookNode: View | null, imageSource: any) => {
    if (!bookNode || !cartIconRef.current) return;

    bookNode.measure((_bx, _by, bw, bh, bpx, bpy) => {
      (cartIconRef.current as View).measure((_cx, _cy, cw, ch, cpx, cpy) => {
        flyX.setValue(bpx);
        flyY.setValue(bpy);
        flyScale.setValue(1);
        flyOpacity.setValue(1);
        setFlyingBook({ source: imageSource, width: bw, height: bh });

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

  const renderHeader = () => (
    <View>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=128` }}
            style={styles.avatar}
          />
          <View style={styles.userInfoText}>
            <Text style={styles.hello}>Xin chào,</Text>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{userName} 👋</Text>
          </View>
        </View>

        {/* Icon chuông + giỏ hàng */}
        <View style={styles.headerIcons}>
          <View style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={25} color={COLORS.text} />
            <View style={styles.notificationDot} />
          </View>
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
      <SearchBar value={search} onChangeText={setSearch} />

      {/* BANNER */}
      <View style={styles.bannerSection}>
        <BannerCard onPress={() => console.log('Mua ngay')} />
      </View>

      {/* RECENTLY VIEWED */}
      {newBooks.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Sản phẩm xem gần đây" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {newBooks.map((book, index) => (
              <BookCard
                key={book.id}
                image={getImageSource(book, index + 2)}
                title={book.title}
                author={book.authors && book.authors.length > 0 ? book.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật'}
                price={formatPrice(book.sale_price)}
                rating={parseFloat(book.avg_rating) || 5.0}
                discount={parseFloat(book.original_price) > parseFloat(book.sale_price) ? `-${Math.round((1 - (parseFloat(book.sale_price) / parseFloat(book.original_price))) * 100)}%` : undefined}
                onPress={() => router.push(`/book/${book.id}`)}
                onAddToCart={() => addContextCart({
                  id: book.id,
                  title: book.title,
                  author: book.authors && book.authors.length > 0 ? book.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật',
                  price: book.sale_price,
                  originalPrice: book.original_price,
                  image: getImageSource(book, index + 2),
                  quantity: 1
                })}
                onCartPress={triggerFlyToCart}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* CATEGORY */}
      {categories.length > 0 && (
        <>
          <SectionHeader title="Danh mục" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {categories.map((cat, i) => (
              <CategoryCard 
                key={cat.id || i} 
                icon={cat.icon_url || 'book-outline'} 
                title={cat.name} 
                onPress={() => router.push('/(tabs)/categories')}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* FLASH SALE */}
      {featuredBooks.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="🔥 Giá sốc hôm nay" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredBooks.map((book, index) => (
              <BookCard
                key={book.id}
                image={getImageSource(book, index)}
                title={book.title}
                author={book.authors && book.authors.length > 0 ? book.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật'}
                price={formatPrice(book.sale_price)}
                rating={parseFloat(book.avg_rating) || 4.9}
                discount={parseFloat(book.original_price) > parseFloat(book.sale_price) ? `-${Math.round((1 - (parseFloat(book.sale_price) / parseFloat(book.original_price))) * 100)}%` : undefined}
                onPress={() => router.push(`/book/${book.id}`)}
                onAddToCart={() => addContextCart({
                  id: book.id,
                  title: book.title,
                  author: book.authors && book.authors.length > 0 ? book.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật',
                  price: book.sale_price,
                  originalPrice: book.original_price,
                  image: getImageSource(book, index),
                  quantity: 1
                })}
                onCartPress={triggerFlyToCart}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* BESTSELLERS */}
      {bestsellers.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Sách nổi bật" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {bestsellers.map((book, index) => (
              <BookCard
                key={book.id}
                image={getImageSource(book, index + 1)}
                title={book.title}
                author={book.authors && book.authors.length > 0 ? book.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật'}
                price={formatPrice(book.sale_price)}
                rating={parseFloat(book.avg_rating) || 4.8}
                discount={parseFloat(book.original_price) > parseFloat(book.sale_price) ? `-${Math.round((1 - (parseFloat(book.sale_price) / parseFloat(book.original_price))) * 100)}%` : undefined}
                onPress={() => router.push(`/book/${book.id}`)}
                onAddToCart={() => addContextCart({
                  id: book.id,
                  title: book.title,
                  author: book.authors && book.authors.length > 0 ? book.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật',
                  price: book.sale_price,
                  originalPrice: book.original_price,
                  image: getImageSource(book, index + 1),
                  quantity: 1
                })}
                onCartPress={triggerFlyToCart}
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* FREE SHIPPING */}
      <View style={styles.shippingCard}>
        <View style={styles.shippingIcon}>
          <Ionicons name="car-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.shippingText}>
          <Text style={styles.shippingTitle}>Miễn phí vận chuyển</Text>
          <Text style={styles.shippingSubtitle}>Cho đơn hàng từ 200.000đ</Text>
        </View>
      </View>

      <View style={styles.allBooksHeader}>
        <SectionHeader title="📚 Tất cả sách" />
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderBookItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.gridItem}>
      <BookCard
        image={getImageSource(item, index)}
        title={item.title}
        author={item.authors && item.authors.length > 0 ? item.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật'}
        price={formatPrice(item.sale_price)}
        rating={parseFloat(item.avg_rating) || 5.0}
        discount={parseFloat(item.original_price) > parseFloat(item.sale_price) ? `-${Math.round((1 - (parseFloat(item.sale_price) / parseFloat(item.original_price))) * 100)}%` : undefined}
        onPress={() => router.push(`/book/${item.id}`)}
        onAddToCart={() => addContextCart({
          id: item.id,
          title: item.title,
          author: item.authors && item.authors.length > 0 ? item.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật',
          price: item.sale_price,
          originalPrice: item.original_price,
          image: getImageSource(item, index),
          quantity: 1
        })}
        onCartPress={triggerFlyToCart}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={allBooks}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={renderBookItem}
          numColumns={2}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onEndReached={loadMoreBooks}
          onEndReachedThreshold={0.5}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}

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
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 10,
  },
  userInfoText: {
    flex: 1,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  hello: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
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
    marginHorizontal: -20,
    paddingHorizontal: 20,
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
  allBooksHeader: {
    marginTop: 30,
    marginBottom: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: 16,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  flyingImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 8,
    zIndex: 9999,
  },
});
