import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Dimensions,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Animated
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import BookCard from '../../components/home/BookCard';

const { width } = Dimensions.get('window');

// ─── Tiny utility ───────────────────────────────────────────────────────────
const Divider = () => <View style={styles.divider} />;

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <View style={styles.starRow}>
    {[1,2,3,4,5].map(s => (
      <TouchableOpacity key={s} onPress={() => onChange(s)} activeOpacity={0.8}>
        <Ionicons
          name={s <= value ? 'star' : 'star-outline'}
          size={38}
          color="#E5A72A"
          style={{ marginHorizontal: 6 }}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const RATING_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Rất tốt', 'Tuyệt vời!'];

// ─── Mock data ───────────────────────────────────────────────────────────────
const BOOKS: Record<string, {
  title: string; author: string; price: string;
  originalPrice: string; discount: string; rating: number;
  image: any; reviewsCount: number; soldCount: string;
  publisher: string; publishYear: number; pages: number; format: string;
  description: string; stock: number;
}> = {
  '1': {
    title: 'Đắc Nhân Tâm', author: 'Dale Carnegie',
    price: '89.000đ', originalPrice: '120.000đ', discount: '-25%',
    rating: 4.8, image: require('../../assets/images/book1.jpg'),
    reviewsCount: 1245, soldCount: '12.5k',
    publisher: 'NXB Tổng Hợp TPHCM', publishYear: 2023, pages: 320, format: 'Bìa mềm',
    description: 'Đắc Nhân Tâm là cuốn sách kinh điển về nghệ thuật giao tiếp và tạo dựng mối quan hệ. Với những nguyên tắc vượt thời gian, cuốn sách đã thay đổi cuộc đời hàng triệu người trên thế giới.\n\nCuốn sách không chỉ dạy bạn cách chinh phục lòng người mà còn giúp bạn trở thành phiên bản tốt hơn của chính mình trong công việc, cuộc sống và các mối quan hệ.',
    stock: 8,
  },
  '2': {
    title: 'Nhà Giả Kim', author: 'Paulo Coelho',
    price: '55.000đ', originalPrice: '75.000đ', discount: '-26%',
    rating: 4.9, image: require('../../assets/images/book2.jpg'),
    reviewsCount: 2340, soldCount: '28k',
    publisher: 'NXB Hội Nhà Văn', publishYear: 2023, pages: 228, format: 'Bìa mềm',
    description: 'Nhà Giả Kim là hành trình huyền bí của chàng chăn cừu Santiago trên con đường tìm kiếm kho báu. Nhưng ý nghĩa sâu xa hơn, đó là cuộc hành trình khám phá bản thân và ý nghĩa cuộc sống.\n\nMột cuốn sách truyền cảm hứng mạnh mẽ, đã được dịch ra hơn 80 thứ tiếng và bán hàng chục triệu bản trên toàn thế giới.',
    stock: 3,
  },
  '3': {
    title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', author: 'Nguyễn Nhật Ánh',
    price: '65.000đ', originalPrice: '85.000đ', discount: '-23%',
    rating: 4.7, image: require('../../assets/images/book3.jpg'),
    reviewsCount: 890, soldCount: '9.2k',
    publisher: 'NXB Trẻ', publishYear: 2022, pages: 348, format: 'Bìa mềm',
    description: 'Câu chuyện về tuổi thơ hồn nhiên, trong sáng của hai anh em Thiều và Tường tại một làng quê nghèo miền Trung. Tác phẩm gợi lên những ký ức đẹp về một thời thơ ấu đã qua, về tình anh em, tình làng xóm.',
    stock: 15,
  },
  '4': {
    title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', author: 'Rosie Nguyễn',
    price: '49.000đ', originalPrice: '79.000đ', discount: '-38%',
    rating: 4.8, image: require('../../assets/images/book4.jpg'),
    reviewsCount: 3120, soldCount: '35k',
    publisher: 'NXB Hội Nhà Văn', publishYear: 2023, pages: 256, format: 'Bìa cứng',
    description: 'Cuốn sách dành riêng cho những bạn trẻ đang trong giai đoạn khám phá bản thân và tìm kiếm hướng đi trong cuộc sống. Với văn phong gần gũi và chân thực, Rosie Nguyễn đã truyền tải những bài học quý giá từ chính trải nghiệm của mình.',
    stock: 21,
  },
};

// ─── Component chính ─────────────────────────────────────────────────────────
export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = BOOKS[id as string] ?? BOOKS['1'];

  const [isFavorite, setIsFavorite] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');

  // Hiệu ứng nhấn yêu thích (Scale animation – Feedback tức thì)
  const heartScale = useRef(new Animated.Value(1)).current;
  const handleFavorite = () => {
    setIsFavorite(v => !v);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmitReview = () => {
    setModalVisible(false);
    setMyComment('');
    setMyRating(5);
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
                  source={book.image}
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
            <Text style={styles.salePrice}>{book.price}</Text>
            <Text style={styles.originalPrice}>{book.originalPrice}</Text>
            <View style={styles.discountPill}>
              <Text style={styles.discountText}>{book.discount}</Text>
            </View>
          </View>

          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>
            bởi <Text style={styles.authorLink}>{book.author}</Text>
          </Text>

          {/* Social proof bar */}
          <View style={styles.socialBar}>
            <View style={styles.socialItem}>
              <Ionicons name="star" size={15} color="#E5A72A" />
              <Text style={styles.socialText}>{book.rating}</Text>
              <Text style={styles.socialSub}> ({book.reviewsCount})</Text>
            </View>
            <View style={styles.socialDot} />
            <View style={styles.socialItem}>
              <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} />
              <Text style={styles.socialText}> Đã bán {book.soldCount}</Text>
            </View>
            {book.stock <= 10 && (
              <>
                <View style={styles.socialDot} />
                {/* Scarcity Effect – chỉ còn ít – thúc đẩy hành động */}
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>🔥 Còn {book.stock} cuốn</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <Divider />

        {/* ── 3. VOUCHER ────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ưu đãi dành cho bạn</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {[
              { icon: 'ticket-outline', label: 'Giảm 15.000đ' },
              { icon: 'car-outline', label: 'Freeship' },
              { icon: 'gift-outline', label: 'Quà tặng kèm' },
            ].map((v, i) => (
              <TouchableOpacity key={i} style={styles.voucherChip} activeOpacity={0.8}>
                <Ionicons name={v.icon as any} size={15} color={COLORS.primaryDark} />
                <Text style={styles.voucherLabel}>{v.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Divider />

        {/* ── 4. CHI TIẾT SÁCH ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết sách</Text>
          <View style={styles.specsGrid}>
            {[
              ['Tác giả', book.author],
              ['Nhà xuất bản', book.publisher],
              ['Năm xuất bản', String(book.publishYear)],
              ['Số trang', `${book.pages} trang`],
              ['Hình thức', book.format],
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
          <Text style={styles.descText}>{book.description}</Text>
        </View>

        <Divider />

        {/* ── 6. ĐÁNH GIÁ ─────────────────────────────────────────
          Social Proof + Reciprocity: Hiển thị đánh giá thực → tạo uy tín.
          Nút "Viết đánh giá" → kích thích người dùng tham gia.
        */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Đánh giá & Nhận xét</Text>
            <TouchableOpacity style={styles.writeBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="pencil-outline" size={13} color={COLORS.primaryDark} />
              <Text style={styles.writeBtnText}> Viết đánh giá</Text>
            </TouchableOpacity>
          </View>

          {/* Tóm tắt điểm đánh giá */}
          <View style={styles.ratingOverview}>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingBigNum}>{book.rating}</Text>
              <Text style={styles.ratingBigStar}>★</Text>
            </View>
            <View style={styles.ratingBars}>
              {[5,4,3,2,1].map(s => (
                <View key={s} style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarLabel}>{s}</Text>
                  <View style={styles.ratingBarTrack}>
                    <View style={[styles.ratingBarFill, { width: `${s===5?72:s===4?18:s===3?6:2}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Review cards */}
          {[
            { name: 'Hoàng Nam', initial: 'H', stars: 5, date: '2 ngày trước', text: 'Sách bọc cẩn thận, giao nhanh. Nội dung rất hay, rất đáng đọc và suy ngẫm!' },
            { name: 'Thu Hà', initial: 'T', stars: 4, date: '1 tuần trước', text: 'Chất lượng sách tốt. Nội dung mang lại nhiều giá trị, đặc biệt phù hợp cho người mới bắt đầu.' },
          ].map((rv, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={[styles.avatar, { backgroundColor: i === 0 ? COLORS.primary : '#7C6AF0' }]}>
                  <Text style={styles.avatarText}>{rv.initial}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.reviewerName}>{rv.name}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 2 }}>
                    {Array.from({ length: rv.stars }).map((_, si) => (
                      <Ionicons key={si} name="star" size={12} color="#E5A72A" />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{rv.date}</Text>
              </View>
              <Text style={styles.reviewText}>{rv.text}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>Xem tất cả {book.reviewsCount} đánh giá</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        <Divider />

        {/* ── 7. GỢI Ý SẢN PHẨM ───────────────────────────────────
          Mere Exposure Effect: Thấy nhiều sản phẩm → quen → muốn mua thêm
        */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Có thể bạn sẽ thích</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
            <BookCard image={require('../../assets/images/book2.jpg')} title="Nhà Giả Kim" author="Paulo Coelho" price="55.000đ" rating={4.9} onPress={() => router.push('/book/2')} onAddToCart={() => {}} />
            <BookCard image={require('../../assets/images/book3.jpg')} title="Tôi thấy hoa vàng..." author="Nguyễn Nhật Ánh" price="65.000đ" rating={4.7} onPress={() => router.push('/book/3')} onAddToCart={() => {}} />
            <BookCard image={require('../../assets/images/book4.jpg')} title="Tuổi trẻ đáng giá bao nhiêu" author="Rosie Nguyễn" price="49.000đ" rating={4.8} onPress={() => router.push('/book/4')} onAddToCart={() => {}} />
          </ScrollView>
        </View>

      </ScrollView>

      {/* ── FLOATING BOTTOM BAR ───────────────────────────────────
        Fitts's Law: CTA to, chiếm vùng ngón cái dễ với.
        Von Restorff Effect: Nút "Mua ngay" màu đậm nổi bật tuyệt đối.
      */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.85}>
          <Ionicons name="cart-outline" size={24} color={COLORS.text} />
          <Text style={styles.cartBtnText}>Giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} activeOpacity={0.85}>
          <Text style={styles.buyBtnText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* ── MODAL VIẾT ĐÁNH GIÁ ──────────────────────────────────── */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>Đánh giá của bạn</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>{book.title}</Text>

            <StarPicker value={myRating} onChange={setMyRating} />
            <Text style={styles.ratingLabel}>{RATING_LABELS[myRating]}</Text>

            <TextInput
              style={styles.reviewInput}
              placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={myComment}
              onChangeText={setMyComment}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview} activeOpacity={0.85}>
              <Text style={styles.submitText}>Gửi đánh giá</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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
    ...StyleSheet.absoluteFillObject,
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
  writeBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  writeBtnText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '700' },

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
