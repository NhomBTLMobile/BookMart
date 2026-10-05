import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  ScrollView,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';

const FAQS = [
  {
    question: 'Làm thế nào để đổi trả sách?',
    answer: 'Bạn có thể yêu cầu đổi trả sách trong vòng 7 ngày kể từ khi nhận hàng nếu sách bị lỗi từ nhà sản xuất hoặc hư hỏng trong quá trình vận chuyển. Vui lòng vào mục "Đơn hàng của tôi" để gửi yêu cầu.'
  },
  {
    question: 'Phí vận chuyển được tính như thế nào?',
    answer: 'Phí vận chuyển phụ thuộc vào khoảng cách giao hàng và khối lượng đơn hàng. Chúng tôi miễn phí vận chuyển cho các đơn hàng có giá trị trên 300.000 VNĐ.'
  },
  {
    question: 'Tôi có thể thanh toán bằng những hình thức nào?',
    answer: 'BookMart hỗ trợ thanh toán khi nhận hàng (COD), thanh toán qua thẻ tín dụng/ghi nợ, và các ví điện tử phổ biến như MoMo, ZaloPay.'
  }
];

export default function SupportScreen() {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(0);

  const handleCall = () => {
    Linking.openURL('tel:19001000');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@bookmart.vn');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trung tâm hỗ trợ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Contact Options */}
        <Text style={styles.sectionTitle}>Liên hệ với chúng tôi</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={handleCall} activeOpacity={0.8}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="call" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.contactTitle}>Hotline</Text>
            <Text style={styles.contactSub}>1900 1000</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmail} activeOpacity={0.8}>
            <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="mail" size={24} color="#2196F3" />
            </View>
            <Text style={styles.contactTitle}>Email</Text>
            <Text style={styles.contactSub}>support@bookmart.vn</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Câu hỏi thường gặp</Text>
        <View style={styles.faqContainer}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqHeader} 
                  onPress={() => setExpandedIndex(isExpanded ? null : index)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQuestion, isExpanded && { color: COLORS.primary }]}>
                    {faq.question}
                  </Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={isExpanded ? COLORS.primary : COLORS.textSecondary} 
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

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

  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  contactRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  contactTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  contactSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  faqContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  faqQuestion: {
    flex: 1,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    paddingRight: SPACING.md,
    lineHeight: 22,
  },
  faqBody: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  faqAnswer: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
