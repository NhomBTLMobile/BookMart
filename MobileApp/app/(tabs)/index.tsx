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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const carAnim = useRef(new Animated.Value(0)).current;

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (text.trim().length > 0) {
      setShowSuggestions(true);
      setIsSearching(true);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await homeService.searchBooks(text.trim(), 1, 5);
          if (res.success) {
            setSuggestions(res.data);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const { cartCount, addToCart: addContextCart } = useCart();

  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [newBooks, setNewBooks] = useState<any[]>([]);
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  
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
        const [featuredRes, newRes, bestsellersRes, categoriesRes, allBooksRes, combosRes, vouchersRes] = await Promise.all([
          homeService.getFeaturedBooks(5),
          homeService.getNewBooks(5),
          homeService.getBestsellers(5),
          homeService.getCategories(),
          homeService.getAllBooks(1, 6),
          homeService.getCombos(5),
          homeService.getVouchers()
        ]);
        
        if (featuredRes.success) setFeaturedBooks(featuredRes.data);
        if (newRes.success) setNewBooks(newRes.data);
        if (bestsellersRes.success) setBestsellers(bestsellersRes.data);
        if (categoriesRes.success) setCategories(categoriesRes.data);
        if (combosRes.success) setCombos(combosRes.data);
        if (vouchersRes.success && vouchersRes.data.length > 0) {
          setVouchers(vouchersRes.data);
        }
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

    // Car Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(carAnim, {
          toValue: 5,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(carAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
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
      <View style={styles.searchWrapper}>
        <SearchBar 
          value={search} 
          onChangeText={handleSearchChange} 
          onSubmitEditing={() => {
            setShowSuggestions(false);
            if (search.trim()) {
              router.push(`/search?q=${encodeURIComponent(search.trim())}`);
            }
          }}
        />
        {showSuggestions && (
          <View style={styles.suggestionsDropdown}>
            {isSearching ? (
              <View style={styles.suggestionItem}>
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 10 }} />
                <Text style={styles.suggestionText}>Đang tìm...</Text>
              </View>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map((book) => (
                  <TouchableOpacity 
                    key={book.id} 
                    style={styles.suggestionItem}
                    onPress={() => {
                      setShowSuggestions(false);
                      router.push(`/book/${book.id}`);
                    }}
                  >
                    <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.suggestionText} numberOfLines={1}>{book.title}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={styles.viewAllSuggestions}
                  onPress={() => {
                    setShowSuggestions(false);
                    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
                  }}
                >
                  <Text style={styles.viewAllText}>Xem tất cả kết quả cho "{search}"</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>Không có kết quả nào.</Text>
              </View>
            )}
          </View>
        )}
      </View>

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
                originalPrice={parseFloat(book.original_price) > parseFloat(book.sale_price) ? formatPrice(book.original_price) : undefined}
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
                originalPrice={parseFloat(book.original_price) > parseFloat(book.sale_price) ? formatPrice(book.original_price) : undefined}
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
                originalPrice={parseFloat(book.original_price) > parseFloat(book.sale_price) ? formatPrice(book.original_price) : undefined}
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

      {/* COMBOS */}
      {combos.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="🎁 Combo Sách Tiết Kiệm" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {combos.map((combo, index) => (
              <BookCard
                key={combo.id || index}
                image={combo.cover_image_url ? { uri: combo.cover_image_url } : getPlaceholderImage(index)}
                title={combo.name}
                author={combo.stock_qty ? `Còn lại: ${combo.stock_qty} bộ` : 'Đang cập nhật'}
                price={formatPrice(combo.combo_price)}
                originalPrice={parseFloat(combo.original_total) > parseFloat(combo.combo_price) ? formatPrice(combo.original_total) : undefined}
                rating={5.0}
                discount={parseFloat(combo.original_total) > parseFloat(combo.combo_price) ? `-${Math.round((1 - (parseFloat(combo.combo_price) / parseFloat(combo.original_total))) * 100)}%` : undefined}
                onPress={() => router.push(`/combo/${combo.id}` as any)}
                onAddToCart={() => addContextCart({
                  id: combo.id,
                  title: combo.name,
                  author: combo.stock_qty ? `Còn lại: ${combo.stock_qty} bộ` : 'Đang cập nhật',
                  price: combo.combo_price,
                  originalPrice: combo.original_total,
                  image: combo.cover_image_url ? { uri: combo.cover_image_url } : getPlaceholderImage(index),
                  quantity: 1
                })}
                onCartPress={triggerFlyToCart}
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* VOUCHERS */}
      {vouchers.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="🎟️ Mã giảm giá & Ưu đãi" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {vouchers.map((v, index) => {
              const theme = v.type === 'shipping' 
                ? { bg: '#E3F2FD', border: '#90CAF9', icon: '#1976D2', title: '#1565C0', sub: '#1E88E5', btn: '#1976D2' }
                : { bg: '#FFF3E0', border: '#FFCC80', icon: '#E65100', title: '#E65100', sub: '#F57C00', btn: '#F57C00' };
              
              return (
                <View 
                  key={v.id || index} 
                  style={[
                    styles.shippingCard, 
                    { 
                      marginTop: 0, 
                      width: 310, 
                      marginRight: 15,
                      backgroundColor: theme.bg,
                      borderColor: theme.border
                    }
                  ]}
                >
                  <Animated.View style={[
                    styles.shippingIcon, 
                    v.type === 'shipping' ? { transform: [{ translateX: carAnim }] } : {},
                    { shadowColor: theme.icon }
                  ]}>
                    <Ionicons name={v.type === 'shipping' ? "car-sport" : "ticket"} size={24} color={theme.icon} />
                  </Animated.View>
                  <View style={styles.shippingText}>
                    <Text style={[styles.shippingTitle, { color: theme.title }]}>
                      {v.type === 'shipping' ? 'Miễn phí vận chuyển' : 'Voucher giảm giá'}
                    </Text>
                    <Text style={[styles.shippingSubtitle, { color: theme.sub }]} numberOfLines={2}>
                      Giảm {formatPrice(v.value)} cho đơn từ {formatPrice(v.min_order_value)}
                    </Text>
                  </View>
                  <TouchableOpacity style={[styles.shippingBtn, { backgroundColor: theme.btn }]} onPress={() => console.log('Lấy mã', v.code)}>
                    <Text style={styles.shippingBtnText}>Lấy mã</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

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
        style={styles.bookCardOverrides}
        image={getImageSource(item, index)}
        title={item.title}
        author={item.authors && item.authors.length > 0 ? item.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật'}
        price={formatPrice(item.sale_price)}
        originalPrice={parseFloat(item.original_price) > parseFloat(item.sale_price) ? formatPrice(item.original_price) : undefined}
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
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={renderFooter()}
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
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 15,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  shippingIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shippingText: {
    marginLeft: 12,
    flex: 1,
  },
  shippingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1565C0',
  },
  shippingSubtitle: {
    fontSize: 12,
    color: '#1E88E5',
    marginTop: 3,
  },
  shippingBtn: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  shippingBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  allBooksHeader: {
    marginTop: 35,
    marginBottom: 15,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 20,
  },
  bookCardOverrides: {
    width: '100%',
    marginRight: 0,
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
  searchWrapper: {
    zIndex: 10,
    elevation: 10,
    position: 'relative',
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
  viewAllSuggestions: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
});
