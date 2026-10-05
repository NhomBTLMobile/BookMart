import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';
import { api } from '../services/api';

const fmt = (n: any) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

export default function OrderReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Record<string, { rating: number; body: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [hasEarnedPoints, setHasEarnedPoints] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data?.success) {
        const orderItems = res.data.data.items || [];
        setItems(orderItems);
        
        // Initialize reviews state
        const initialReviews: Record<string, any> = {};
        orderItems.forEach((item: any) => {
          initialReviews[item.id] = { rating: 5, body: '' };
        });
        setReviews(initialReviews);
        setHasEarnedPoints(res.data.data.hasEarnedReviewPoints || false);
      }
    } catch (error) {
      console.log('Error fetching order', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (itemId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], rating }
    }));
  };

  const handleBodyChange = (itemId: string, body: string) => {
    setReviews(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], body }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let successCount = 0;
    let earnedPointsThisTime = false;

    try {
      for (const item of items) {
        if (item.isReviewed) continue; // Bỏ qua nếu đã đánh giá rồi
        
        const rev = reviews[item.id];
        if (rev && rev.rating > 0) {
          const payload = {
            order_item_id: item.id,
            book_id: item.isCombo ? null : item.book_id,
            combo_id: item.isCombo ? item.combo_id : null,
            rating: rev.rating,
            body: rev.body
          };
          
          try {
            const res = await api.post('/reviews', payload);
            successCount++;
            if (res.data?.data?.pointsAwarded) {
              earnedPointsThisTime = true;
            }
          } catch (e: any) {
            console.error('Error posting review', e.response?.data || e.message);
            if (e.response?.status === 400) {
              Alert.alert('Lỗi', e.response?.data?.message || 'Sản phẩm này đã được đánh giá');
            }
          }
        }
      }

      if (successCount > 0) {
        if (earnedPointsThisTime) {
          Alert.alert(
            'Cảm ơn bạn!',
            `Đánh giá đã được gửi. Bạn nhận được +500 điểm thưởng cho đơn hàng này!`,
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } else {
          Alert.alert(
            'Cảm ơn bạn!',
            `Đánh giá đã được gửi.`,
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } else {
        Alert.alert('Thông báo', 'Không có đánh giá mới nào được gửi.');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!hasEarnedPoints && !items.every(i => i.isReviewed) && (
          <View style={styles.infoBanner}>
            <Ionicons name="gift" size={24} color={COLORS.warning} />
            <Text style={styles.infoText}>
              Nhận ngay <Text style={{fontWeight: 'bold', color: COLORS.warning}}>500 điểm</Text> khi hoàn tất đánh giá đơn hàng này!
            </Text>
          </View>
        )}

        {items.map((item) => {
          const rev = reviews[item.id] || { rating: 5, body: '' };
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.itemRow}>
                <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="cover" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.item_name}</Text>
                  {item.isCombo && (
                    <View style={styles.comboBadge}>
                      <Text style={styles.comboBadgeText}>COMBO</Text>
                    </View>
                  )}
                  <Text style={styles.itemPrice}>{fmt(item.unit_price)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {item.isReviewed ? (
                <View style={styles.reviewedOverlay}>
                  <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
                  <Text style={styles.reviewedText}>Đã đánh giá</Text>
                </View>
              ) : (
                <>
                  <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Chất lượng sản phẩm</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity 
                          key={star} 
                          onPress={() => handleRating(item.id, star)}
                          style={styles.starBtn}
                        >
                          <Ionicons 
                            name={star <= rev.rating ? "star" : "star-outline"} 
                            size={32} 
                            color={star <= rev.rating ? "#FFB800" : COLORS.divider} 
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.ratingDesc}>
                      {rev.rating === 1 ? 'Tệ' : 
                       rev.rating === 2 ? 'Không hài lòng' : 
                       rev.rating === 3 ? 'Bình thường' : 
                       rev.rating === 4 ? 'Hài lòng' : 'Tuyệt vời'}
                    </Text>
                  </View>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                    placeholderTextColor={COLORS.textHint}
                    multiline
                    numberOfLines={4}
                    value={rev.body}
                    onChangeText={(txt) => handleBodyChange(item.id, txt)}
                    textAlignVertical="top"
                  />
                </>
              )}
            </View>
          );
        })}
      </ScrollView>

      {!items.every(i => i.isReviewed) && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? SPACING.sm : SPACING.xl,
    paddingBottom: SPACING.md,
    ...SHADOW.sm,
    zIndex: 10,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  
  content: {
    paddingBottom: SPACING['3xl'],
  },

  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: '#8D6E63',
    lineHeight: 20,
  },

  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 50,
    height: 70,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primaryDark,
    fontWeight: FONT_WEIGHT.bold,
  },
  comboBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  comboBadgeText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reviewedOverlay: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  reviewedText: {
    color: COLORS.success,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },

  ratingSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  starBtn: {
    padding: 2,
  },
  ratingDesc: {
    fontSize: FONT_SIZE.sm,
    color: '#FFB800',
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 4,
  },

  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    minHeight: 100,
  },

  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
});
