import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  Platform,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';
import { reviewService } from '../services/reviewService';

type Review = {
  id: string;
  book_id: string;
  book_title: string;
  book_image_url: string;
  rating: number;
  body: string;
  created_at: string;
};

const RATING_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Rất tốt', 'Tuyệt vời!'];

export default function MyReviewsScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getMyReviews();
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setMyRating(review.rating);
    setMyComment(review.body);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingReview) return;
    try {
      const res = await reviewService.updateReview(editingReview.id, {
        rating: myRating,
        body: myComment,
      });
      if (res.success !== false) {
        Alert.alert('Thành công', 'Cập nhật đánh giá thành công');
        setModalVisible(false);
        fetchReviews();
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể cập nhật đánh giá');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa đánh giá này?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await reviewService.deleteReview(id);
            if (res.success !== false) {
              Alert.alert('Thành công', 'Đã xóa đánh giá');
              fetchReviews();
            } else {
              Alert.alert('Lỗi', res.message || 'Không thể xóa đánh giá');
            }
          } catch (e) {
            Alert.alert('Lỗi', 'Đã xảy ra lỗi');
          }
        }
      }
    ]);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={COLORS.warning}
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => {
    const d = new Date(item.created_at);
    const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

    return (
      <TouchableOpacity 
        style={styles.reviewCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/book/${item.book_id}` as any)}
      >
        <View style={styles.cardHeader}>
          <Image 
            source={item.book_image_url ? { uri: item.book_image_url } : require('../assets/images/book1.jpg')} 
            style={styles.productImg} 
            contentFit="cover" 
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>{item.book_title}</Text>
            <View style={styles.ratingRow}>
              {renderStars(item.rating)}
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <Text style={styles.reviewBody}>{item.body}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
            <Ionicons name="pencil" size={14} color={COLORS.primaryDark} />
            <Text style={styles.editBtnText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash" size={14} color={COLORS.error} />
            <Text style={styles.deleteBtnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.id.toString()}
          renderItem={renderReview}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color={COLORS.divider} />
              <Text style={styles.emptyText}>Bạn chưa có đánh giá nào</Text>
            </View>
          }
        />
      )}

      {/* ── MODAL CHỈNH SỬA ĐÁNH GIÁ ── */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>Chỉnh sửa đánh giá</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle} numberOfLines={1}>{editingReview?.book_title}</Text>

            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setMyRating(s)} activeOpacity={0.8}>
                  <Ionicons
                    name={s <= myRating ? 'star' : 'star-outline'}
                    size={38}
                    color="#E5A72A"
                    style={{ marginHorizontal: 6 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
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

            <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate} activeOpacity={0.85}>
              <Text style={styles.submitText}>Cập nhật</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? SPACING.sm : SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING['3xl'],
  },
  
  // Card
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImg: {
    width: 50,
    height: 70,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },

  cardBody: {
    paddingTop: SPACING.xs,
  },
  reviewBody: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  editBtnText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  deleteBtnText: { color: COLORS.error, fontSize: 13, fontWeight: '600' },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHandle: { width: 40, height: 5, backgroundColor: COLORS.divider, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  ratingLabel: { textAlign: 'center', color: '#E5A72A', fontSize: 15, fontWeight: '700', marginTop: 8 },
  reviewInput: { backgroundColor: '#F9F9F9', borderRadius: 12, padding: 14, marginTop: 20, fontSize: 15, color: COLORS.text, minHeight: 100 },
  submitBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14, marginTop: 20, alignItems: 'center' },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});
