import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';
import { addressService } from '../services/addressService';

export default function AddressesScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getMyAddresses();
      setAddresses(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert('Xóa địa chỉ', 'Bạn có chắc muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await addressService.deleteAddress(id);
            if (res.success) fetchAddresses();
            else Alert.alert('Lỗi', 'Không thể xóa địa chỉ này');
          } catch (e) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra');
          }
        }
      }
    ]);
  };

  const handleSetDefault = async (id: string) => {
    setLoading(true);
    try {
      const res = await addressService.updateAddress(id, { is_default: true });
      if (res.success !== false) {
        fetchAddresses();
      } else {
        Alert.alert('Lỗi', 'Không thể thiết lập địa chỉ mặc định');
        setLoading(false);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    if (mode === 'select') {
      addressService.setSelectedAddressId(item.id);
      router.back();
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.addressCard, mode === 'select' && styles.addressCardSelectable]}
      activeOpacity={mode === 'select' ? 0.7 : 1}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          <View style={styles.labelBadge}>
            <Text style={styles.labelText}>{item.label || 'Địa chỉ'}</Text>
          </View>
          {item.is_default && (
            <View style={[styles.labelBadge, { backgroundColor: COLORS.error + '15' }]}>
              <Text style={[styles.labelText, { color: COLORS.error }]}>Mặc định</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/address-edit', params: { id: item.id } })}
          >
            <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.name}>{item.recipient_name}  |  {item.phone}</Text>
      <Text style={styles.addressText}>{item.street_address}</Text>
      <Text style={styles.addressText}>{item.ward_name}, {item.district_name}, {item.province_name}</Text>
      
      {!item.is_default && (
        <TouchableOpacity 
          style={styles.setDefaultBtn}
          onPress={() => handleSetDefault(item.id)}
        >
          <Text style={styles.setDefaultText}>Thiết lập mặc định</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={64} color={COLORS.divider} />
              <Text style={styles.emptyText}>Bạn chưa có địa chỉ giao hàng nào</Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => router.push('/address-edit')}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.addBtnText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </View>
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
  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  addressCardSelectable: {
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  labelBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  labelText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
  },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { padding: 4 },
  name: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyState: { alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  addBtnText: { color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold },
  setDefaultBtn: {
    marginTop: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setDefaultText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  }
});
