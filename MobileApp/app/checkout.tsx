// CHECKOUT SCREEN
// ─────────────────────────────────────────────
// Tâm lý học áp dụng:
// • Commitment & Consistency  — hiển thị lại các sách đã chọn → khó bỏ cuộc
// • Authority                 — icon bảo mật SSL, "Thanh toán an toàn"
// • Social Proof              — badge "Giao hàng đảm bảo"
// • Progress Indicator        — step bar (Giỏ hàng → Thanh toán → Hoàn thành)
// • Loss Aversion             — hiển thị tiết kiệm được bao nhiêu
// • Fitts's Law               — nút xác nhận full-width, dễ nhấn
// ─────────────────────────────────────────────

import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SHADOW,
  SPACING,
} from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useCart } from '../context/CartContext';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Switch
} from 'react-native';
import { api } from '../services/api';

// ─── Types ───────────────────────────────────────────────────
type PaymentMethod = 'cod' | 'vnpay';

type OrderItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  image: any;
  quantity: number;
};

type Address = {
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
};


// Removed SAVED_ADDRESS

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; sub: string; icon: string; color: string }[] = [
  { id: 'cod',    label: 'Tiền mặt (COD)', sub: 'Thanh toán khi nhận hàng',    icon: 'cash-outline',   color: '#3E9B4F' },
  { id: 'vnpay', label: 'VNPay',           sub: 'Thanh toán qua cổng VNPay',   icon: 'qr-code-outline', color: '#1A56DB' },
];

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (n: any) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

// ─── Step Indicator ──────────────────────────────────────────
function StepBar({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Giỏ hàng' },
    { n: 2, label: 'Thanh toán' },
    { n: 3, label: 'Hoàn thành' },
  ];
  return (
    <View style={s.stepBar}>
      {steps.map((step, idx) => {
        const done = current > step.n;
        const active = current === step.n;
        return (
          <View key={step.n} style={s.stepItem}>
            <View style={[s.stepCircle, done && s.stepDone, active && s.stepActive]}>
              {done
                ? <Ionicons name="checkmark" size={13} color={COLORS.white} />
                : <Text style={[s.stepNum, active && { color: COLORS.white }]}>{step.n}</Text>
              }
            </View>
            <Text style={[s.stepLabel, active && s.stepLabelActive]}>{step.label}</Text>
            {idx < steps.length - 1 && (
              <View style={[s.stepLine, done && s.stepLineDone]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Section Header ──────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={COLORS.primary} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Success Modal ────────────────────────────────────────────
function SuccessModal({ visible, orderId, total, onClose }: {
  visible: boolean;
  orderId: string;
  total: number;
  onClose: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  if (visible) {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 200 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={s.vModalOverlay}>
        <Animated.View style={[s.modalCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          {/* Icon thành công */}
          <View style={s.successIconWrap}>
            <View style={s.successIconRing}>
              <Ionicons name="checkmark-circle" size={56} color={COLORS.primary} />
            </View>
          </View>

          <Text style={s.successTitle}>Đặt hàng thành công! 🎉</Text>
          <Text style={s.successSub}>
            Cảm ơn bạn đã tin tưởng BookMart.{'\n'}
            Đơn hàng của bạn đang được xử lý.
          </Text>

          {/* Thông tin đơn */}
          <View style={s.successInfo}>
            <View style={s.successRow}>
              <Text style={s.successInfoLabel}>Mã đơn hàng</Text>
              <Text style={s.successInfoValue}>#{orderId}</Text>
            </View>
            <View style={s.successDivider} />
            <View style={s.successRow}>
              <Text style={s.successInfoLabel}>Tổng thanh toán</Text>
              <Text style={[s.successInfoValue, { color: COLORS.primaryDark }]}>{fmt(total)}</Text>
            </View>
            <View style={s.successDivider} />
            <View style={s.successRow}>
              <Text style={s.successInfoLabel}>Dự kiến giao hàng</Text>
              <Text style={s.successInfoValue}>3 – 5 ngày làm việc</Text>
            </View>
          </View>

          {/* Nút hành động */}
          <TouchableOpacity style={s.successPrimaryBtn} onPress={onClose} activeOpacity={0.82}>
            <Text style={s.successPrimaryBtnText}>Về trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.successSecondaryBtn}
            onPress={() => {
              onClose();
              // TODO: navigate to order tracking
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="receipt-outline" size={15} color={COLORS.primaryDark} />
            <Text style={s.successSecondaryBtnText}>Xem đơn hàng</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────
export default function CheckoutScreen() {
  const { items: paramsItems } = useLocalSearchParams<{ items?: string }>();
  const { items: cartItems, clearCart } = useCart();
  const isBuyingFromCart = !paramsItems;
  
  const ORDER_ITEMS = useMemo(() => {
    if (paramsItems) {
      try {
        return JSON.parse(paramsItems);
      } catch (e) {
        return [];
      }
    }
    return cartItems;
  }, [paramsItems, cartItems]);

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [address, setAddress] = useState<any>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);
  
  // -- Loyalty Points --
  const [userPoints, setUserPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  
  // -- Vouchers --
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [vouchersList, setVouchersList] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  useEffect(() => {
    // Luôn xoá bộ nhớ tạm địa chỉ khi VÀO MỚI trang thanh toán
    addressService.setSelectedAddressId(null);
    return () => {
      addressService.setSelectedAddressId(null);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchAddressAndUser = async () => {
        try {
          // Fetch User Points
          const userRes = await api.get('/users/me');
          if (userRes.data?.success && userRes.data?.data?.loyalty_points) {
            setUserPoints(userRes.data.data.loyalty_points);
          }

          // Fetch Address
          const res = await addressService.getMyAddresses();
          if (res && res.length > 0) {
            const selectedId = addressService.getSelectedAddressId();
            if (selectedId) {
              const selectedAddr = res.find((a: any) => a.id === selectedId);
              if (selectedAddr) {
                setAddress(selectedAddr);
                return;
              }
            }
            const defaultAddr = res.find((a: any) => a.is_default) || res[0];
            setAddress(defaultAddr);
          } else {
            setAddress(null);
          }
        } catch(e) {
        } finally {
          setLoadingAddress(false);
        }
      };
      fetchAddressAndUser();
    }, [])
  );

  const totalQty = ORDER_ITEMS.reduce((s: any, i: any) => s + i.quantity, 0);

  useEffect(() => {
    const fetchFee = async () => {
      if (!address || !address.district_id || !address.ward_code) {
        setShippingFee(0);
        return;
      }
      setLoadingFee(true);
      try {
        const res = await orderService.calculateFee({
          to_district_id: parseInt(address.district_id, 10),
          to_ward_code: String(address.ward_code),
          items: ORDER_ITEMS.map((it: any) => ({
            id: it.id,
            quantity: it.quantity
          }))
        });
        if (res.success && res.data && res.data.total) {
          setShippingFee(res.data.total);
        } else {
          setShippingFee(30_000); // fallback
        }
      } catch (e) {
        setShippingFee(30_000);
      } finally {
        setLoadingFee(false);
      }
    };
    fetchFee();
  }, [address, totalQty]);

  // ── Tính tổng ──
  const subtotal = ORDER_ITEMS.reduce((sum: any, it: any) => sum + it.price * it.quantity, 0);
  const originalTotal = ORDER_ITEMS.reduce((sum: any, it: any) => sum + (it.originalPrice ?? it.price) * it.quantity, 0);
  const saved = originalTotal - subtotal;

  // -- Tính giảm giá Voucher --
  let voucherDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percent') {
      voucherDiscount = (subtotal * appliedVoucher.value) / 100;
      if (appliedVoucher.max_discount) {
        voucherDiscount = Math.min(voucherDiscount, appliedVoucher.max_discount);
      }
    } else if (appliedVoucher.type === 'fixed') {
      voucherDiscount = appliedVoucher.value;
    } else if (appliedVoucher.type === 'freeship') {
      voucherDiscount = Math.min(shippingFee, appliedVoucher.value || shippingFee);
    }
  }
  
  // -- Tính giảm giá Điểm thưởng -- (1 điểm = 1đ, dùng tối đa 50% đơn hàng hoặc hết điểm)
  const maxPointsToUse = Math.min(userPoints, Math.floor(subtotal / 2));
  const pointsDiscount = usePoints ? maxPointsToUse : 0;

  const total = Math.max(0, subtotal + shippingFee - voucherDiscount - pointsDiscount);

  const handleOpenVouchers = async () => {
    setShowVoucherModal(true);
    if (vouchersList.length === 0) {
      setLoadingVouchers(true);
      try {
        const res = await api.get('/vouchers');
        if (res.data?.success) {
          setVouchersList(res.data.data.filter((v: any) => v.is_active));
        }
      } catch (e) {
      } finally {
        setLoadingVouchers(false);
      }
    }
  };

  const handleSelectVoucher = (v: any) => {
    if (subtotal < (v.min_order_value || 0)) return; // Disabled
    setAppliedVoucher(v);
    setShowVoucherModal(false);
  };

  const handleConfirm = async () => {
    if (!address) {
      Alert.alert('Lỗi', 'Vui lòng thêm địa chỉ giao hàng trước khi thanh toán');
      return;
    }
    
    Alert.alert(
      'Xác nhận đặt hàng',
      `Tổng thanh toán: ${fmt(total)}\nPhương thức: ${PAYMENT_OPTIONS.find(p => p.id === selectedPayment)?.label}`,
      [
        { text: 'Quay lại', style: 'cancel' },
        { 
          text: 'Đặt hàng', 
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const userStr = await SecureStore.getItemAsync('user');
              const user = userStr ? JSON.parse(userStr) : null;
              
              const itemsPayload = ORDER_ITEMS.map((i: any) => ({
                book_id: i.isCombo ? null : i.id, // Support combo vs book
                combo_id: i.isCombo ? i.id : null,
                item_name: i.title,
                unit_price: i.price,
                quantity: i.quantity,
                total_price: i.price * i.quantity
              }));
              
              const payload = {
                order_code: `BM${Date.now().toString(36).toUpperCase()}`,
                user_id: user?.id,
                address_id: address.id,
                shipping_snapshot: {
                  full_name: address.recipient_name,
                  phone: address.phone,
                  street_address: address.street_address,
                  ward: address.ward_name,
                  district: address.district_name,
                  city: address.province_name,
                  ward_code: address.ward_code,
                  district_id: address.district_id
                },
                subtotal,
                shipping_fee: shippingFee,
                discount_amount: voucherDiscount,
                points_discount: pointsDiscount,
                total_amount: total,
                voucher_id: appliedVoucher?.id || null,
                points_used: pointsDiscount, // 1 point = 1 VND
                payment_method: selectedPayment,
                payment_status: 'pending',
                order_status: 'pending',
                items: itemsPayload
              };
              
              const res = await orderService.createOrder(payload);
              setIsSubmitting(false);
              
              if (res.success !== false) {
                if (isBuyingFromCart) clearCart();
                
                const createdOrderId = res.data?.id; // UUID
                const createdOrderCode = res.data?.order_code || payload.order_code;
                
                if (selectedPayment === 'vnpay' && createdOrderId) {
                  try {
                    const redirectUrl = Linking.createURL('payment-result');
                    const returnUrl = `${api.defaults.baseURL}/payments/vnpay/vnpay_return`;

                    const vnpRes = await api.post('/payments/vnpay/create_url', {
                      order_id: createdOrderCode, // VNPAY không cho phép ký tự "-" trong vnp_TxnRef, nên dùng Order Code (VD: BM...)
                      amount: total,
                      order_info: `Thanh toan don hang ${createdOrderCode}`,
                      return_url: returnUrl
                    }, {
                      params: { app_redirect: redirectUrl } // query string
                    });
                    
                    if (vnpRes.data?.success && vnpRes.data?.data?.payment_url) {
                      const result = await WebBrowser.openAuthSessionAsync(
                        vnpRes.data.data.payment_url,
                        redirectUrl
                      );
                      
                      // WebBrowser.openAuthSessionAsync tự động đóng khi nhận được redirectUrl.
                      if (result.type === 'success' && result.url) {
                        const parsedUrl = Linking.parse(result.url);
                        const status = parsedUrl.queryParams?.status as string || 'failed';
                        const orderId = parsedUrl.queryParams?.orderId as string || createdOrderCode;
                        
                        router.replace({
                          pathname: '/payment-result',
                          params: { status, orderId }
                        });
                      } else if (result.type === 'cancel' || result.type === 'dismiss') {
                        router.replace({
                          pathname: '/payment-result',
                          params: { status: 'failed', orderId: createdOrderCode }
                        });
                      }
                      return;
                    }
                  } catch (e) {
                    Alert.alert('Lỗi', 'Không thể khởi tạo thanh toán VNPAY');
                  }
                }

                router.replace({
                  pathname: '/order-success',
                  params: { orderId: createdOrderCode, total: total.toString() }
                });
              } else {
                Alert.alert('Lỗi', res.message || 'Không thể tạo đơn hàng');
              }
            } catch(e) {
              setIsSubmitting(false);
              Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo đơn');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Thanh toán</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Step Indicator ── */}
          <StepBar current={2} />

          {/* ── Bảo mật ── */}
          <View style={s.securityBadge}>
            <Ionicons name="lock-closed" size={13} color={COLORS.primary} />
            <Text style={s.securityText}>Thanh toán được mã hóa SSL 256-bit</Text>
          </View>

          {/* ══ 1. ĐỊA CHỈ GIAO HÀNG ══ */}
          <View style={s.card}>
            <SectionHeader icon="location-outline" title="Địa chỉ giao hàng" />

            {loadingAddress ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : address ? (
              <View style={s.addressBlock}>
                <View style={s.addressHeader}>
                  <View style={s.addressIconRow}>
                    <Ionicons name="person" size={14} color={COLORS.textSecondary} />
                    <Text style={s.addressName}>{address.recipient_name}</Text>
                  </View>
                  <View style={s.addressIconRow}>
                    <Ionicons name="call" size={14} color={COLORS.textSecondary} />
                    <Text style={s.addressPhone}>{address.phone}</Text>
                  </View>
                </View>

                <View style={s.addressDetailWrap}>
                  <Ionicons name="location" size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={s.addressText}>{address.street_address}</Text>
                    <Text style={s.addressSubText}>
                      {address.ward_name}, {address.district_name}, {address.province_name}
                    </Text>
                  </View>
                </View>

                <View style={s.addressFooter}>
                  {address.is_default && (
                    <View style={s.defaultBadge}>
                      <Text style={s.defaultBadgeText}>Mặc định</Text>
                    </View>
                  )}
                  {address.label && (
                    <View style={s.labelBadge}>
                      <Text style={s.labelBadgeText}>{address.label}</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: COLORS.textSecondary, marginBottom: 10 }}>Bạn chưa có địa chỉ giao hàng</Text>
              </View>
            )}

            <TouchableOpacity 
              style={s.changeBtn} 
              activeOpacity={0.75}
              onPress={() => router.push('/addresses?mode=select')}
            >
              <Ionicons name={address ? "create-outline" : "add-circle-outline"} size={14} color={COLORS.primaryDark} />
              <Text style={s.changeBtnText}>{address ? "Thay đổi địa chỉ" : "Thêm địa chỉ mới"}</Text>
            </TouchableOpacity>
          </View>

          {/* ══ 2. PHƯƠNG THỨC THANH TOÁN ══ */}
          <View style={s.card}>
            <SectionHeader icon="card-outline" title="Phương thức thanh toán" />

            {PAYMENT_OPTIONS.map((option) => {
              const isSelected = selectedPayment === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[s.paymentRow, isSelected && s.paymentRowSelected]}
                  onPress={() => setSelectedPayment(option.id)}
                  activeOpacity={0.75}
                >
                  {/* Left: icon */}
                  <View style={[s.paymentIconWrap, { backgroundColor: option.color + '18' }]}>
                    <Ionicons name={option.icon as any} size={20} color={option.color} />
                  </View>

                  {/* Middle: text */}
                  <View style={s.paymentTextWrap}>
                    <Text style={[s.paymentLabel, isSelected && s.paymentLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={s.paymentSub}>{option.sub}</Text>
                  </View>

                  {/* Right: radio */}
                  <View style={[s.radio, isSelected && s.radioSelected]}>
                    {isSelected && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ══ 4. KHUYẾN MÃI & ĐIỂM THƯỞNG ══ */}
          <View style={s.card}>
            <SectionHeader icon="pricetag-outline" title="Ưu đãi & Điểm thưởng" />
            
            <TouchableOpacity style={s.voucherSelectorBtn} onPress={handleOpenVouchers}>
              <Ionicons name="ticket-outline" size={20} color={COLORS.primary} />
              <Text style={s.voucherSelectorText}>
                {appliedVoucher ? `Đã chọn mã: ${appliedVoucher.code}` : 'Chọn mã Voucher giảm giá'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            {appliedVoucher && (
              <View style={s.appliedVoucherRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={s.appliedVoucherText}>
                  {appliedVoucher.type === 'percent' ? `Giảm ${appliedVoucher.value}%` : 
                   appliedVoucher.type === 'freeship' ? `Freeship (Tối đa ${fmt(appliedVoucher.value)})` : 
                   `Giảm ${fmt(appliedVoucher.value)}`}
                </Text>
                <TouchableOpacity onPress={() => setAppliedVoucher(null)}>
                  <Ionicons name="close-circle" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            )}

            <View style={s.summaryDivider} />

            <View style={s.pointsRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.pointsTitle}>Dùng điểm BookMart</Text>
                <Text style={s.pointsSub}>Bạn có {(Number(userPoints) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} điểm</Text>
              </View>
              <Switch
                value={usePoints}
                onValueChange={setUsePoints}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={usePoints ? COLORS.primary : '#f4f3f4'}
                disabled={userPoints === 0}
              />
            </View>
            {usePoints && (
              <Text style={s.pointsDiscountText}>
                - {(Number(pointsDiscount) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ (Dùng {(Number(pointsDiscount) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} điểm)
              </Text>
            )}
          </View>

          {/* ══ 5. TÓM TẮT ĐƠN HÀNG ══ */}
          <View style={s.card}>
            <SectionHeader icon="bag-outline" title={`Đơn hàng (${totalQty} cuốn)`} />

            {ORDER_ITEMS.map((item: any) => (
              <View key={item.id} style={s.orderItemRow}>
                <Image source={item.image} style={s.orderItemImage} />
                <View style={s.orderItemBody}>
                  <Text style={s.orderItemTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={s.orderItemAuthor}>{item.author}</Text>
                  <View style={s.orderItemFooter}>
                    <Text style={s.orderItemPrice}>{fmt(item.price)}</Text>
                    <Text style={s.orderItemQty}>× {item.quantity}</Text>
                    <Text style={s.orderItemSubtotal}>{fmt(item.price * item.quantity)}</Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={s.summaryDivider} />



            <View style={s.summaryGrid}>
              <View style={s.summaryLine}>
                <Text style={s.summaryLabel}>Tạm tính</Text>
                <Text style={s.summaryValue}>{fmt(subtotal)}</Text>
              </View>
              <View style={s.summaryLine}>
                <Text style={s.summaryLabel}>Phí vận chuyển</Text>
                {loadingFee ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : shippingFee === 0 ? (
                  <Text style={[s.summaryValue, { color: COLORS.success }]}>Miễn phí</Text>
                ) : (
                  <Text style={s.summaryValue}>{fmt(shippingFee)}</Text>
                )}
              </View>
              {voucherDiscount > 0 && (
                <View style={s.summaryLine}>
                  <Text style={s.summaryLabel}>Voucher giảm giá</Text>
                  <Text style={[s.summaryValue, { color: COLORS.success }]}>-{fmt(voucherDiscount)}</Text>
                </View>
              )}
              {pointsDiscount > 0 && (
                <View style={s.summaryLine}>
                  <Text style={s.summaryLabel}>Dùng điểm thưởng</Text>
                  <Text style={[s.summaryValue, { color: COLORS.success }]}>-{fmt(pointsDiscount)}</Text>
                </View>
              )}
              <View style={s.totalLine}>
                <Text style={s.totalLabel}>Tổng thanh toán</Text>
                <Text style={s.totalValue}>{fmt(total)}</Text>
              </View>
            </View>
          </View>

          {/* ══ 6. GHI CHÚ ══ */}
          <View style={s.card}>
            <SectionHeader icon="create-outline" title="Ghi chú đơn hàng" />
            <TextInput
              style={s.noteInput}
              placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
              placeholderTextColor={COLORS.textHint}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* ══ 7. CHÍNH SÁCH ══ */}
          <View style={s.policyRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textSecondary} />
            <Text style={s.policyText}>
              Đổi trả miễn phí trong 7 ngày • Giao hàng toàn quốc
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Thanh xác nhận (fixed bottom) ── */}
      <View style={s.bottomBar}>
        <View style={s.bottomTotal}>
          <Text style={s.bottomTotalLabel}>Tổng thanh toán</Text>
          <Text style={s.bottomTotalValue}>{fmt(total)}</Text>
        </View>
        <TouchableOpacity 
          style={[s.confirmBtn, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleConfirm} 
          activeOpacity={0.82}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
              <Text style={s.confirmBtnText}>Xác nhận đặt hàng</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Voucher Modal */}
      <Modal visible={showVoucherModal} animationType="slide" transparent>
        <View style={s.vModalOverlay}>
          <View style={s.vModalContent}>
            <View style={s.vModalHeader}>
              <Text style={s.vModalTitle}>Chọn Voucher</Text>
              <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {loadingVouchers ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
              <ScrollView contentContainerStyle={s.voucherList}>
                {vouchersList.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: COLORS.textSecondary, marginTop: 20 }}>Không có mã giảm giá nào.</Text>
                ) : (
                  vouchersList.map((v: any) => {
                    const isValid = subtotal >= (v.min_order_value || 0);
                    return (
                      <TouchableOpacity 
                        key={v.id} 
                        style={[s.voucherItem, !isValid && s.voucherItemDisabled]}
                        onPress={() => handleSelectVoucher(v)}
                        activeOpacity={isValid ? 0.7 : 1}
                      >
                        <View style={s.voucherItemLeft}>
                          <Ionicons name="ticket" size={24} color={isValid ? COLORS.primary : COLORS.textSecondary} />
                        </View>
                        <View style={s.voucherItemRight}>
                          <Text style={[s.voucherItemCode, !isValid && { color: COLORS.textSecondary }]}>{v.code}</Text>
                          <Text style={s.voucherItemDesc}>
                            {v.type === 'percent' ? `Giảm ${v.value}% (tối đa ${fmt(v.max_discount)})` :
                             v.type === 'freeship' ? `Freeship (tối đa ${fmt(v.value)})` :
                             `Giảm ${fmt(v.value)}`}
                          </Text>
                          <Text style={s.voucherItemMin}>
                            Đơn tối thiểu {fmt(v.min_order_value || 0)}
                          </Text>
                          {!isValid && (
                            <Text style={s.voucherError}>Chưa đủ điều kiện</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['5xl'] - SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOW.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.md,
  },

  // ── Step Bar ──
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 0,
  },
  stepItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  stepNum: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.textSecondary },
  stepLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  stepLabelActive: { color: COLORS.primaryDark, fontWeight: FONT_WEIGHT.bold },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  stepLineDone: { backgroundColor: COLORS.primary },

  // ── Security badge ──
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    alignSelf: 'center',
  },
  securityText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primaryDark,
    fontWeight: FONT_WEIGHT.semibold,
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.md,
    ...SHADOW.sm,
  },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  // ── Address ──
  addressBlock: { 
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  addressIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressName: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  addressPhone: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  
  addressDetailWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: 4,
  },
  addressText: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: FONT_WEIGHT.medium },
  addressSubText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20 },
  
  addressFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  defaultBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: { fontSize: 11, color: COLORS.primary, fontWeight: FONT_WEIGHT.bold },
  labelBadge: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  labelBadgeText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.bold },

  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.primaryDark,
  },
  changeBtnText: { fontSize: FONT_SIZE.sm, color: COLORS.primaryDark, fontWeight: FONT_WEIGHT.semibold },

  // ── Payment ──
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  paymentRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  paymentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTextWrap: { flex: 1 },
  paymentLabel: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },
  paymentLabelSelected: { color: COLORS.primaryDark },
  paymentSub: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  // ── Voucher & Points ──
  voucherSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  voucherSelectorText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  appliedVoucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF7ED',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  appliedVoucherText: { flex: 1, color: COLORS.success, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  pointsSub: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  pointsDiscountText: { fontSize: FONT_SIZE.sm, color: COLORS.success, fontWeight: FONT_WEIGHT.semibold, marginTop: SPACING.xs },

  // ── Order Items ──
  orderItemRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  orderItemImage: {
    width: 60,
    height: 80,
    borderRadius: RADIUS.sm,
    resizeMode: 'cover',
  },
  orderItemBody: { flex: 1, justifyContent: 'space-between' },
  orderItemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    lineHeight: 20,
  },
  orderItemAuthor: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  orderItemFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  orderItemPrice: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.primaryDark },
  orderItemQty: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  orderItemSubtotal: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },

  // ── Summary ──
  summaryDivider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.sm },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: '#EDF7ED',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  savedText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  savedAmount: { fontWeight: FONT_WEIGHT.bold, color: COLORS.success },
  summaryGrid: { gap: SPACING.sm },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xs,
  },
  totalLabel: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  totalValue: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.primaryDark },

  // ── Note ──
  noteInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    minHeight: 80,
    lineHeight: 20,
  },

  // ── Policy ──
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  policyText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── Bottom Bar ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: SPACING.lg,
    ...SHADOW.lg,
  },
  bottomTotal: { flex: 1 },
  bottomTotalLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  bottomTotalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primaryDark,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 5,
  },
  confirmBtnText: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },

  // ── Success Modal ──
  successOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    width: '100%',
    alignItems: 'center',
    gap: SPACING.lg,
    ...SHADOW.lg,
  },
  successIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  successTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.text,
    textAlign: 'center',
  },
  successSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  successInfo: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  successInfoLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  successInfoValue: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  successDivider: { height: 1, backgroundColor: COLORS.divider },
  successPrimaryBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  successPrimaryBtnText: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  successSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  successSecondaryBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primaryDark,
  },

  // -- Modal Voucher --
  vModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  vModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
  },
  vModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  vModalTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  voucherList: { padding: SPACING.md, gap: SPACING.sm },
  voucherItem: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  voucherItemDisabled: { backgroundColor: COLORS.background, opacity: 0.6 },
  voucherItemLeft: {
    width: 60,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    borderStyle: 'dashed'
  },
  voucherItemRight: { padding: SPACING.sm, flex: 1, justifyContent: 'center' },
  voucherItemCode: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary, marginBottom: 2 },
  voucherItemDesc: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  voucherItemMin: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 4 },
  voucherError: { fontSize: FONT_SIZE.xs, color: COLORS.error, marginTop: 2, fontWeight: FONT_WEIGHT.bold },
});
