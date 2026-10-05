import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  ScrollView,
  Image,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';

export default function AboutScreen() {
  
  const openSocial = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Về BookMart</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.logoContainer}>
            <Ionicons name="book" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>BookMart</Text>
          <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.description}>
            BookMart là ứng dụng mua bán sách trực tuyến hàng đầu, mang đến cho bạn trải nghiệm mua sắm tiện lợi, nhanh chóng và an toàn. Chúng tôi tự hào cung cấp hàng ngàn đầu sách đa dạng thể loại từ các nhà xuất bản uy tín nhất.
          </Text>
        </View>

        {/* Links */}
        <View style={styles.linkGroup}>
          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkLabel}>Điều khoản sử dụng</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textHint} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkLabel}>Chính sách bảo mật</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textHint} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="star-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkLabel}>Đánh giá ứng dụng</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textHint} />
          </TouchableOpacity>
        </View>

        {/* Social Media */}
        <Text style={styles.socialTitle}>Theo dõi chúng tôi</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity 
            style={styles.socialBtn} 
            onPress={() => openSocial('https://facebook.com')}
          >
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialBtn} 
            onPress={() => openSocial('https://instagram.com')}
          >
            <Ionicons name="logo-instagram" size={24} color="#E4405F" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialBtn} 
            onPress={() => openSocial('https://twitter.com')}
          >
            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2026 BookMart. All rights reserved.</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

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

  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },

  appInfo: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  appName: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOW.sm,
  },
  description: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'center',
  },

  linkGroup: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    ...SHADOW.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  linkLabel: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 40,
  },

  socialTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING['3xl'],
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textHint,
  }
});
