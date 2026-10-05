import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';
import { bookService } from '../services/bookService';

export default function ReviewsScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingCounts, setRatingCounts] = useState<any>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0 });
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await bookService.getBookReviews(bookId as string, 100);
        if (res.success && res.data) {
          setReviews(res.data);
          
          let totalScore = 0;
          const counts: any = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: res.data.length };
          res.data.forEach((r: any) => {
            if (counts[r.rating] !== undefined) counts[r.rating]++;
            totalScore += r.rating;
          });
          setRatingCounts(counts);
          setAvgRating(counts.total > 0 ? totalScore / counts.total : 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (bookId) fetchData();
  }, [bookId]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        {item.user_avatar_url ? (
          <Image source={{ uri: item.user_avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.avatarText}>{(item.user_name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.reviewerName}>{item.user_name || 'Người dùng'}</Text>
          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            {Array.from({ length: item.rating || 5 }).map((_, si) => (
              <Ionicons key={si} name="star" size={12} color="#E5A72A" />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>
          {new Date(item.created_at).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      <Text style={styles.reviewText}>{item.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả đánh giá</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            reviews.length > 0 ? (
              <View style={styles.ratingOverview}>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingBigNum}>{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}</Text>
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
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.divider} />
              <Text style={styles.emptyText}>Chưa có đánh giá nào cho sách này</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F5' },
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
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: SPACING.lg, paddingBottom: SPACING['4xl'] },
  
  ratingOverview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg,
    ...SHADOW.sm,
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
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  reviewDate: { fontSize: 12, color: COLORS.textSecondary },
  reviewText: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginTop: 12 },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: SPACING.md, color: COLORS.textSecondary },
});
