import axios from 'axios';

// Cổng API chính thức của GHN
const ghnApi = axios.create({
  baseURL: 'https://online-gateway.ghn.vn/shiip/public-api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

ghnApi.interceptors.request.use((config) => {
  const token = process.env.GHN_TOKEN?.trim();
  const shopId = process.env.GHN_SHOP_ID?.trim();
  if (token) config.headers['Token'] = token;
  if (shopId) config.headers['ShopId'] = shopId;
  return config;
});

/**
 * 🚚 TẠO ĐƠN GHN (TRANG ADMIN):
 * Chế độ DEV: Luôn giả lập mã vận đơn, KHÔNG gọi lên GHN thật
 * để tránh phát sinh cước phí và tài xế đến lấy hàng thật từ tài khoản GHN của shop.
 */
export const createGHNOrder = async (orderData) => {
  console.log("🚚 [ADMIN DEV MODE] Đang tạo vận đơn GHN giả lập...");
  const randomCode = 'GHN' + Math.floor(10000000 + Math.random() * 90000000);
  return {
    code: 200,
    message: 'Tạo đơn hàng thành công (Admin Dev Mode)',
    data: {
      order_code: randomCode,
      total_fee: 28000,
      expected_delivery_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
};

/**
 * 💰 TÍNH PHÍ VẬN CHUYỂN:
 * DÙNG API THẬT CỦA GHN (Lấy Token và Shop ID từ file .env)
 */
export const calculateGHNFee = async (feeData) => {
  try {
    const response = await ghnApi.post('/v2/shipping-order/fee', feeData);
    return response.data;
  } catch (error) {
    console.error("Lỗi tính phí từ API thật GHN:", error.response?.data || error.message);
    const errMessage = error.response?.data?.message || error.message || 'Lỗi khi kết nối với GHN';
    const err = new Error(errMessage);
    err.status = error.response?.status || 400;
    throw err;
  }
};

/**
 * 🗺️ Lấy danh mục Tỉnh/Thành từ API Thật của GHN
 */
export const getGHNProvinces = async () => {
  const response = await ghnApi.get('/master-data/province');
  return response.data?.data || [];
};

/**
 * 🗺️ Lấy danh mục Quận/Huyện từ API Thật của GHN
 */
export const getGHNDistricts = async (provinceId) => {
  const response = await ghnApi.get('/master-data/district', {
    params: { province_id: Number(provinceId) }
  });
  return response.data?.data || [];
};

/**
 * 🗺️ Lấy danh mục Phường/Xã từ API Thật của GHN
 */
export const getGHNWards = async (districtId) => {
  const response = await ghnApi.get('/master-data/ward', {
    params: { district_id: Number(districtId) }
  });
  return response.data?.data || [];
};
