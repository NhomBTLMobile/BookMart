import axios from 'axios';

const ghnApi = axios.create({
  baseURL: 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2',
  headers: {
    'Content-Type': 'application/json'
  }
});

ghnApi.interceptors.request.use((config) => {
  config.headers['Token'] = process.env.GHN_TOKEN?.trim();
  config.headers['ShopId'] = process.env.GHN_SHOP_ID?.trim();
  console.log("GHN Interceptor: Token=", process.env.GHN_TOKEN, "ShopId=", process.env.GHN_SHOP_ID);
  return config;
});

export const createGHNOrder = async (orderData) => {
  try {
    const response = await ghnApi.post('/shipping-order/create', orderData);
    return response.data;
  } catch (error) {
    console.error("Lỗi tạo đơn GHN:", error.response?.data || error.message);
    const errMessage = error.response?.data?.message || 'Lỗi khi kết nối với GHN';
    const err = new Error(errMessage);
    err.status = 400;
    throw err;
  }
}
