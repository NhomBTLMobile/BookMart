import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView, 
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';
import { addressService } from '../services/addressService';
import { ghnService } from '../services/ghnService';

type SelectorModal = 'NONE' | 'PROVINCE' | 'DISTRICT' | 'WARD';

export default function AddressEditScreen() {
  const { id } = useLocalSearchParams();
  const isEdit = !!id;

  const [label, setLabel] = useState('Nhà riêng');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [provinceName, setProvinceName] = useState('');
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [districtName, setDistrictName] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [wardName, setWardName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  
  // GHN Data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [modalType, setModalType] = useState<SelectorModal>('NONE');

  useEffect(() => {
    // Load initial data
    const init = async () => {
      setLoading(true);
      try {
        const provs = await ghnService.getProvinces();
        // GHN provinces are sorted by province_name, sometimes not perfectly.
        setProvinces(provs.sort((a: any, b: any) => a.ProvinceName.localeCompare(b.ProvinceName)));

        if (isEdit) {
          const addr = await addressService.getAddressById(id as string);
          if (addr) {
            setLabel(addr.label || 'Nhà riêng');
            setName(addr.recipient_name || '');
            setPhone(addr.phone || '');
            setStreet(addr.street_address || '');
            
            setProvinceId(addr.province_id);
            setProvinceName(addr.province_name);
            setDistrictId(addr.district_id);
            setDistrictName(addr.district_name);
            setWardCode(addr.ward_code);
            setWardName(addr.ward_name);
            setIsDefault(!!addr.is_default);
            
            // Fetch districts and wards for the selected ones to populate state
            if (addr.province_id) {
               const dists = await ghnService.getDistricts(addr.province_id);
               setDistricts(dists.sort((a: any, b: any) => a.DistrictName.localeCompare(b.DistrictName)));
            }
            if (addr.district_id) {
               const wds = await ghnService.getWards(addr.district_id);
               setWards(wds.sort((a: any, b: any) => a.WardName.localeCompare(b.WardName)));
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleSelectProvince = async (item: any) => {
    setProvinceId(item.ProvinceID);
    setProvinceName(item.ProvinceName);
    setDistrictId(null);
    setDistrictName('');
    setWardCode('');
    setWardName('');
    setModalType('NONE');
    setLoading(true);
    const dists = await ghnService.getDistricts(item.ProvinceID);
    setDistricts(dists.sort((a: any, b: any) => a.DistrictName.localeCompare(b.DistrictName)));
    setLoading(false);
  };

  const handleSelectDistrict = async (item: any) => {
    setDistrictId(item.DistrictID);
    setDistrictName(item.DistrictName);
    setWardCode('');
    setWardName('');
    setModalType('NONE');
    setLoading(true);
    const wds = await ghnService.getWards(item.DistrictID);
    setWards(wds.sort((a: any, b: any) => a.WardName.localeCompare(b.WardName)));
    setLoading(false);
  };

  const handleSelectWard = (item: any) => {
    setWardCode(item.WardCode);
    setWardName(item.WardName);
    setModalType('NONE');
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !street.trim() || !provinceId || !districtId || !wardCode) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const data = {
        label,
        recipient_name: name,
        phone,
        province_id: provinceId,
        province_name: provinceName,
        district_id: districtId,
        district_name: districtName,
        ward_code: wardCode,
        ward_name: wardName,
        street_address: street,
        is_default: isDefault
      };

      if (isEdit) {
        await addressService.updateAddress(id as string, data);
        Alert.alert('Thành công', 'Đã cập nhật địa chỉ', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        await addressService.createAddress(data);
        Alert.alert('Thành công', 'Đã thêm địa chỉ mới', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const openSelector = (type: SelectorModal) => {
    if (type === 'DISTRICT' && !provinceId) {
      Alert.alert('Thông báo', 'Vui lòng chọn Tỉnh/Thành phố trước');
      return;
    }
    if (type === 'WARD' && !districtId) {
      Alert.alert('Thông báo', 'Vui lòng chọn Quận/Huyện trước');
      return;
    }
    setModalType(type);
  };

  const renderSelectorModal = () => {
    let data: any[] = [];
    let title = '';
    let onSelect: (item: any) => void = () => {};

    if (modalType === 'PROVINCE') {
      data = provinces;
      title = 'Chọn Tỉnh/Thành phố';
      onSelect = handleSelectProvince;
    } else if (modalType === 'DISTRICT') {
      data = districts;
      title = 'Chọn Quận/Huyện';
      onSelect = handleSelectDistrict;
    } else if (modalType === 'WARD') {
      data = wards;
      title = 'Chọn Phường/Xã';
      onSelect = handleSelectWard;
    }

    return (
      <Modal visible={modalType !== 'NONE'} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setModalType('NONE')} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.modalItemText}>
                    {modalType === 'PROVINCE' ? item.ProvinceName : 
                     modalType === 'DISTRICT' ? item.DistrictName : 
                     item.WardName}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textHint} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.formCard}>
            
            {/* Label */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại địa chỉ</Text>
              <View style={styles.labelSelector}>
                {['Nhà riêng', 'Cơ quan'].map(l => (
                  <TouchableOpacity 
                    key={l}
                    style={[styles.labelChip, label === l && styles.labelChipActive]}
                    onPress={() => setLabel(l)}
                  >
                    <Text style={[styles.labelChipText, label === l && styles.labelChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên người nhận</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={COLORS.textHint}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  placeholderTextColor={COLORS.textHint}
                />
              </View>
            </View>

            {/* Province */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tỉnh/Thành phố</Text>
              <TouchableOpacity style={styles.selectorWrapper} onPress={() => openSelector('PROVINCE')}>
                <Text style={[styles.selectorText, !provinceName && { color: COLORS.textHint }]}>
                  {provinceName || 'Chọn Tỉnh/Thành phố'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textHint} />
              </TouchableOpacity>
            </View>

            {/* District */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quận/Huyện</Text>
              <TouchableOpacity style={styles.selectorWrapper} onPress={() => openSelector('DISTRICT')}>
                <Text style={[styles.selectorText, !districtName && { color: COLORS.textHint }]}>
                  {districtName || 'Chọn Quận/Huyện'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textHint} />
              </TouchableOpacity>
            </View>

            {/* Ward */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phường/Xã</Text>
              <TouchableOpacity style={styles.selectorWrapper} onPress={() => openSelector('WARD')}>
                <Text style={[styles.selectorText, !wardName && { color: COLORS.textHint }]}>
                  {wardName || 'Chọn Phường/Xã'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textHint} />
              </TouchableOpacity>
            </View>

            {/* Street Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ cụ thể</Text>
              <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: SPACING.sm }]}>
                <TextInput 
                  style={[styles.input, { textAlignVertical: 'top' }]}
                  value={street}
                  onChangeText={setStreet}
                  placeholder="Nhập số nhà, tên đường..."
                  multiline
                  placeholderTextColor={COLORS.textHint}
                />
              </View>
            </View>

            {/* Set Default */}
            <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm }]}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Đặt làm địa chỉ mặc định</Text>
              <Switch 
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>

          </View>
          
          <TouchableOpacity 
            style={[styles.mainSaveBtn, loading && styles.disabledBtn]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.mainSaveBtnText}>Lưu địa chỉ</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {renderSelectorModal()}
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
  content: { padding: SPACING.lg, paddingBottom: SPACING['4xl'] },
  
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOW.sm,
  },
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text, marginBottom: 8 },
  
  labelSelector: { flexDirection: 'row', gap: SPACING.md },
  labelChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surfaceAlt,
  },
  labelChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  labelChipText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  labelChipTextActive: { color: COLORS.primaryDark, fontWeight: FONT_WEIGHT.bold },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    height: 48,
  },
  input: { flex: 1, fontSize: FONT_SIZE.base, color: COLORS.text, height: '100%' },

  selectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    height: 48,
  },
  selectorText: { fontSize: FONT_SIZE.base, color: COLORS.text },

  mainSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  mainSaveBtnText: { color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold },
  disabledBtn: { backgroundColor: COLORS.border },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    height: '70%',
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: SPACING.sm,
  },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  modalItemText: { fontSize: FONT_SIZE.base, color: COLORS.text },
});
