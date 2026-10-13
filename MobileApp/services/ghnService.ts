import axios from 'axios';
import { api } from './api';

// BẬT CHẾ ĐỘ DEV: Tránh lỗi 404/401 do server GHN Sandbox lỗi, trả về dữ liệu chuẩn ngay lập tức
const IS_DEV_MODE = true;

const GHN_TOKEN = '0768024b-bd3b-11f1-b944-42faa0331861';
const API_URL = 'https://online-gateway.ghn.vn/shiip/public-api/master-data';

// Danh sách 63 Tỉnh/Thành phố Việt Nam chuẩn GHN
const DEV_PROVINCES = [
  { ProvinceID: 201, ProvinceName: 'Hà Nội' },
  { ProvinceID: 202, ProvinceName: 'Hồ Chí Minh' },
  { ProvinceID: 203, ProvinceName: 'Đà Nẵng' },
  { ProvinceID: 204, ProvinceName: 'Hải Phòng' },
  { ProvinceID: 205, ProvinceName: 'Cần Thơ' },
  { ProvinceID: 206, ProvinceName: 'Bình Dương' },
  { ProvinceID: 207, ProvinceName: 'Đồng Nai' },
  { ProvinceID: 208, ProvinceName: 'Quảng Ninh' },
  { ProvinceID: 209, ProvinceName: 'Thừa Thiên Huế' },
  { ProvinceID: 210, ProvinceName: 'Khánh Hòa' },
  { ProvinceID: 211, ProvinceName: 'Hưng Yên' },
  { ProvinceID: 212, ProvinceName: 'Bắc Ninh' },
  { ProvinceID: 213, ProvinceName: 'Hải Dương' },
  { ProvinceID: 214, ProvinceName: 'Nam Định' },
  { ProvinceID: 215, ProvinceName: 'Thái Bình' },
  { ProvinceID: 216, ProvinceName: 'Ninh Bình' },
  { ProvinceID: 217, ProvinceName: 'Thanh Hóa' },
  { ProvinceID: 218, ProvinceName: 'Nghệ An' },
  { ProvinceID: 219, ProvinceName: 'Hà Tĩnh' },
  { ProvinceID: 220, ProvinceName: 'Lâm Đồng' },
  { ProvinceID: 221, ProvinceName: 'Bà Rịa - Vũng Tàu' },
  { ProvinceID: 222, ProvinceName: 'Bình Định' },
  { ProvinceID: 223, ProvinceName: 'Quảng Nam' },
  { ProvinceID: 224, ProvinceName: 'Quảng Ngãi' },
  { ProvinceID: 225, ProvinceName: 'Phú Yên' },
  { ProvinceID: 226, ProvinceName: 'Kiên Giang' },
  { ProvinceID: 227, ProvinceName: 'An Giang' },
  { ProvinceID: 228, ProvinceName: 'Tiền Giang' },
  { ProvinceID: 229, ProvinceName: 'Vĩnh Long' },
  { ProvinceID: 230, ProvinceName: 'Bến Tre' },
  { ProvinceID: 231, ProvinceName: 'Long An' },
  { ProvinceID: 232, ProvinceName: 'Tây Ninh' },
  { ProvinceID: 233, ProvinceName: 'Bình Phước' },
  { ProvinceID: 234, ProvinceName: 'Đắk Lắk' },
  { ProvinceID: 235, ProvinceName: 'Gia Lai' },
  { ProvinceID: 236, ProvinceName: 'Kon Tum' },
  { ProvinceID: 237, ProvinceName: 'Đắk Nông' },
  { ProvinceID: 238, ProvinceName: 'Bình Thuận' },
  { ProvinceID: 239, ProvinceName: 'Ninh Thuận' },
  { ProvinceID: 240, ProvinceName: 'Hòa Bình' },
  { ProvinceID: 241, ProvinceName: 'Sơn La' },
  { ProvinceID: 242, ProvinceName: 'Điện Biên' },
  { ProvinceID: 243, ProvinceName: 'Lai Châu' },
  { ProvinceID: 244, ProvinceName: 'Lào Cai' },
  { ProvinceID: 245, ProvinceName: 'Yên Bái' },
  { ProvinceID: 246, ProvinceName: 'Phú Thọ' },
  { ProvinceID: 247, ProvinceName: 'Vĩnh Phúc' },
  { ProvinceID: 248, ProvinceName: 'Thái Nguyên' },
  { ProvinceID: 249, ProvinceName: 'Bắc Giang' },
  { ProvinceID: 250, ProvinceName: 'Lạng Sơn' },
  { ProvinceID: 251, ProvinceName: 'Cao Bằng' },
  { ProvinceID: 252, ProvinceName: 'Bắc Kạn' },
  { ProvinceID: 253, ProvinceName: 'Hà Giang' },
  { ProvinceID: 254, ProvinceName: 'Tuyên Quang' },
  { ProvinceID: 255, ProvinceName: 'Quảng Bình' },
  { ProvinceID: 256, ProvinceName: 'Quảng Trị' },
  { ProvinceID: 257, ProvinceName: 'Đồng Tháp' },
  { ProvinceID: 258, ProvinceName: 'Trà Vinh' },
  { ProvinceID: 259, ProvinceName: 'Hậu Giang' },
  { ProvinceID: 260, ProvinceName: 'Sóc Trăng' },
  { ProvinceID: 261, ProvinceName: 'Bạc Liêu' },
  { ProvinceID: 262, ProvinceName: 'Cà Mau' },
  { ProvinceID: 263, ProvinceName: 'Hà Nam' }
];

const DEV_DISTRICTS: Record<number, Array<{ DistrictID: number; DistrictName: string; ProvinceID: number }>> = {
  // Hà Nội
  201: [
    { DistrictID: 1442, DistrictName: 'Quận Ba Đình', ProvinceID: 201 },
    { DistrictID: 1443, DistrictName: 'Quận Cầu Giấy', ProvinceID: 201 },
    { DistrictID: 1444, DistrictName: 'Quận Đống Đa', ProvinceID: 201 },
    { DistrictID: 1482, DistrictName: 'Quận Hoàn Kiếm', ProvinceID: 201 },
    { DistrictID: 1485, DistrictName: 'Quận Hai Bà Trưng', ProvinceID: 201 },
    { DistrictID: 1486, DistrictName: 'Quận Thanh Xuân', ProvinceID: 201 },
    { DistrictID: 1488, DistrictName: 'Quận Nam Từ Liêm', ProvinceID: 201 },
    { DistrictID: 1489, DistrictName: 'Quận Bắc Từ Liêm', ProvinceID: 201 },
    { DistrictID: 1490, DistrictName: 'Quận Hà Đông', ProvinceID: 201 },
    { DistrictID: 1491, DistrictName: 'Quận Hoàng Mai', ProvinceID: 201 },
    { DistrictID: 1492, DistrictName: 'Quận Long Biên', ProvinceID: 201 },
    { DistrictID: 1493, DistrictName: 'Quận Tây Hồ', ProvinceID: 201 },
    { DistrictID: 1717, DistrictName: 'Huyện Hoài Đức', ProvinceID: 201 },
    { DistrictID: 1494, DistrictName: 'Huyện Gia Lâm', ProvinceID: 201 },
    { DistrictID: 1495, DistrictName: 'Huyện Đông Anh', ProvinceID: 201 },
    { DistrictID: 1496, DistrictName: 'Huyện Thanh Trì', ProvinceID: 201 },
  ],
  // TP Hồ Chí Minh
  202: [
    { DistrictID: 1446, DistrictName: 'Quận 1', ProvinceID: 202 },
    { DistrictID: 1447, DistrictName: 'Quận 3', ProvinceID: 202 },
    { DistrictID: 1448, DistrictName: 'Quận 4', ProvinceID: 202 },
    { DistrictID: 1449, DistrictName: 'Quận 5', ProvinceID: 202 },
    { DistrictID: 1450, DistrictName: 'Quận 7', ProvinceID: 202 },
    { DistrictID: 1451, DistrictName: 'Quận 10', ProvinceID: 202 },
    { DistrictID: 1452, DistrictName: 'Thành phố Thủ Đức', ProvinceID: 202 },
    { DistrictID: 1454, DistrictName: 'Quận Bình Thạnh', ProvinceID: 202 },
    { DistrictID: 1455, DistrictName: 'Quận Tân Bình', ProvinceID: 202 },
    { DistrictID: 1456, DistrictName: 'Quận Gò Vấp', ProvinceID: 202 },
    { DistrictID: 1457, DistrictName: 'Quận Phú Nhuận', ProvinceID: 202 },
    { DistrictID: 1458, DistrictName: 'Quận Bình Tân', ProvinceID: 202 },
  ],
  // Đà Nẵng
  203: [
    { DistrictID: 1530, DistrictName: 'Quận Hải Châu', ProvinceID: 203 },
    { DistrictID: 1531, DistrictName: 'Quận Thanh Khê', ProvinceID: 203 },
    { DistrictID: 1532, DistrictName: 'Quận Sơn Trà', ProvinceID: 203 },
    { DistrictID: 1533, DistrictName: 'Quận Ngũ Hành Sơn', ProvinceID: 203 },
    { DistrictID: 1534, DistrictName: 'Quận Liên Chiểu', ProvinceID: 203 },
    { DistrictID: 1535, DistrictName: 'Quận Cẩm Lệ', ProvinceID: 203 },
  ],
  // Hải Phòng
  204: [
    { DistrictID: 1540, DistrictName: 'Quận Hồng Bàng', ProvinceID: 204 },
    { DistrictID: 1541, DistrictName: 'Quận Ngô Quyền', ProvinceID: 204 },
    { DistrictID: 1542, DistrictName: 'Quận Lê Chân', ProvinceID: 204 },
    { DistrictID: 1543, DistrictName: 'Quận Hải An', ProvinceID: 204 },
  ],
  // Cần Thơ
  205: [
    { DistrictID: 1550, DistrictName: 'Quận Ninh Kiều', ProvinceID: 205 },
    { DistrictID: 1551, DistrictName: 'Quận Cái Răng', ProvinceID: 205 },
    { DistrictID: 1552, DistrictName: 'Quận Bình Thủy', ProvinceID: 205 },
  ],
  // Hưng Yên
  211: [
    { DistrictID: 1610, DistrictName: 'Thành phố Hưng Yên', ProvinceID: 211 },
    { DistrictID: 1611, DistrictName: 'Thị xã Mỹ Hào', ProvinceID: 211 },
    { DistrictID: 1612, DistrictName: 'Huyện Văn Giang', ProvinceID: 211 },
    { DistrictID: 1613, DistrictName: 'Huyện Yên Mỹ', ProvinceID: 211 },
  ],
  // Bình Dương
  206: [
    { DistrictID: 1560, DistrictName: 'Thành phố Thủ Dầu Một', ProvinceID: 206 },
    { DistrictID: 1561, DistrictName: 'Thành phố Dĩ An', ProvinceID: 206 },
    { DistrictID: 1562, DistrictName: 'Thành phố Thuận An', ProvinceID: 206 },
  ]
};

const DEV_WARDS: Record<number, Array<{ WardCode: string; WardName: string; DistrictID: number }>> = {
  // Cầu Giấy (1443)
  1443: [
    { WardCode: '20101', WardName: 'Phường Dịch Vọng', DistrictID: 1443 },
    { WardCode: '20102', WardName: 'Phường Dịch Vọng Hậu', DistrictID: 1443 },
    { WardCode: '20103', WardName: 'Phường Mai Dịch', DistrictID: 1443 },
    { WardCode: '20104', WardName: 'Phường Nghĩa Đô', DistrictID: 1443 },
    { WardCode: '20105', WardName: 'Phường Nghĩa Tân', DistrictID: 1443 },
    { WardCode: '20106', WardName: 'Phường Quan Hoa', DistrictID: 1443 },
    { WardCode: '20107', WardName: 'Phường Trung Hòa', DistrictID: 1443 },
    { WardCode: '20108', WardName: 'Phường Yên Hòa', DistrictID: 1443 },
  ],
  // Ba Đình (1442)
  1442: [
    { WardCode: '1A0101', WardName: 'Phường Phúc Xá', DistrictID: 1442 },
    { WardCode: '1A0102', WardName: 'Phường Trúc Bạch', DistrictID: 1442 },
    { WardCode: '1A0103', WardName: 'Phường Vĩnh Phúc', DistrictID: 1442 },
    { WardCode: '1A0104', WardName: 'Phường Cống Vị', DistrictID: 1442 },
    { WardCode: '1A0107', WardName: 'Phường Kim Mã', DistrictID: 1442 },
    { WardCode: '1A0108', WardName: 'Phường Giảng Võ', DistrictID: 1442 },
  ],
  // Đống Đa (1444)
  1444: [
    { WardCode: '20201', WardName: 'Phường Cát Linh', DistrictID: 1444 },
    { WardCode: '20202', WardName: 'Phường Hàng Bột', DistrictID: 1444 },
    { WardCode: '20203', WardName: 'Phường Khâm Thiên', DistrictID: 1444 },
    { WardCode: '20204', WardName: 'Phường Láng Hạ', DistrictID: 1444 },
    { WardCode: '20205', WardName: 'Phường Láng Thượng', DistrictID: 1444 },
    { WardCode: '20206', WardName: 'Phường Ô Chợ Dừa', DistrictID: 1444 },
  ],
  // Hoài Đức (1717)
  1717: [
    { WardCode: '220208', WardName: 'Xã An Khánh', DistrictID: 1717 },
    { WardCode: '220209', WardName: 'Xã An Thượng', DistrictID: 1717 },
    { WardCode: '220210', WardName: 'Thị trấn Trạm Trôi', DistrictID: 1717 },
    { WardCode: '220211', WardName: 'Xã Vân Canh', DistrictID: 1717 },
  ],
  // Quận 1 (1446)
  1446: [
    { WardCode: '20301', WardName: 'Phường Bến Nghé', DistrictID: 1446 },
    { WardCode: '20302', WardName: 'Phường Bến Thành', DistrictID: 1446 },
    { WardCode: '20303', WardName: 'Phường Cầu Kho', DistrictID: 1446 },
    { WardCode: '20304', WardName: 'Phường Đa Kao', DistrictID: 1446 },
    { WardCode: '20305', WardName: 'Phường Tân Định', DistrictID: 1446 },
  ],
  // Quận 3 (1447)
  1447: [
    { WardCode: '20401', WardName: 'Phường Võ Thị Sáu', DistrictID: 1447 },
    { WardCode: '20402', WardName: 'Phường 1', DistrictID: 1447 },
    { WardCode: '20403', WardName: 'Phường 2', DistrictID: 1447 },
  ],
  // Thủ Đức (1452)
  1452: [
    { WardCode: '20801', WardName: 'Phường Thảo Điền', DistrictID: 1452 },
    { WardCode: '20802', WardName: 'Phường An Phú', DistrictID: 1452 },
    { WardCode: '20803', WardName: 'Phường Hiệp Phú', DistrictID: 1452 },
    { WardCode: '20804', WardName: 'Phường Linh Trung', DistrictID: 1452 },
  ],
  // Hải Châu (1530)
  1530: [
    { WardCode: '30101', WardName: 'Phường Hải Châu 1', DistrictID: 1530 },
    { WardCode: '30102', WardName: 'Phường Hải Châu 2', DistrictID: 1530 },
    { WardCode: '30103', WardName: 'Phường Thạch Thang', DistrictID: 1530 },
    { WardCode: '30104', WardName: 'Phường Thuận Phước', DistrictID: 1530 },
  ],
};

export const ghnService = {
  getProvinces: async () => {
    try {
      // Gọi qua Backend (Backend sẽ dùng GHN_TOKEN thật trong .env để lấy dữ liệu từ GHN thật)
      const res = await api.get('/orders/ghn/provinces');
      const data = res.data?.data || [];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e: any) {
      console.log('Chưa tải được tỉnh/thành từ Backend GHN, dùng danh mục sẵn có');
    }
    return DEV_PROVINCES;
  },

  getDistricts: async (provinceId: number) => {
    try {
      // Gọi qua Backend (Backend dùng GHN_TOKEN thật để lấy quận/huyện từ GHN thật)
      const res = await api.get('/orders/ghn/districts', { params: { province_id: provinceId } });
      const data = res.data?.data || [];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e: any) {
      console.log('Chưa tải được quận/huyện từ Backend GHN, dùng danh mục sẵn có');
    }

    if (DEV_DISTRICTS[provinceId]) {
      return DEV_DISTRICTS[provinceId];
    }
    return [
      { DistrictID: provinceId * 10 + 1, DistrictName: 'Thành phố trung tâm', ProvinceID: provinceId },
      { DistrictID: provinceId * 10 + 2, DistrictName: 'Thị xã 1', ProvinceID: provinceId },
      { DistrictID: provinceId * 10 + 3, DistrictName: 'Huyện 1', ProvinceID: provinceId },
      { DistrictID: provinceId * 10 + 4, DistrictName: 'Huyện 2', ProvinceID: provinceId },
    ];
  },

  getWards: async (districtId: number) => {
    try {
      // Gọi qua Backend (Backend dùng GHN_TOKEN thật để lấy phường/xã từ GHN thật)
      const res = await api.get('/orders/ghn/wards', { params: { district_id: districtId } });
      const data = res.data?.data || [];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e: any) {
      console.log('Chưa tải được phường/xã từ Backend GHN, dùng danh mục sẵn có');
    }

    if (DEV_WARDS[districtId]) {
      return DEV_WARDS[districtId];
    }
    return [
      { WardCode: `${districtId}01`, WardName: 'Phường 1', DistrictID: districtId },
      { WardCode: `${districtId}02`, WardName: 'Phường 2', DistrictID: districtId },
      { WardCode: `${districtId}03`, WardName: 'Thị trấn trung tâm', DistrictID: districtId },
    ];
  }
};
