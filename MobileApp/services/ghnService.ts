import axios from 'axios';

const GHN_TOKEN = '0768024b-bd3b-11f1-b944-42faa0331861';
const API_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data';

export const ghnService = {
  getProvinces: async () => {
    try {
      const res = await axios.get(`${API_URL}/province`, { headers: { token: GHN_TOKEN } });
      const data = res.data.data || [];
      return data.filter((item: any) => !item.ProvinceName.toLowerCase().includes('test') && !item.ProvinceName.toLowerCase().includes('alert'));
    } catch (e) {
      console.error('Lỗi lấy tỉnh/thành', e);
      return [];
    }
  },
  getDistricts: async (provinceId: number) => {
    try {
      const res = await axios.get(`${API_URL}/district`, {
        params: { province_id: provinceId },
        headers: { token: GHN_TOKEN }
      });
      const data = res.data.data || [];
      return data.filter((item: any) => !item.DistrictName.toLowerCase().includes('test') && !item.DistrictName.toLowerCase().includes('alert'));
    } catch (e) {
      console.error('Lỗi lấy quận/huyện', e);
      return [];
    }
  },
  getWards: async (districtId: number) => {
    try {
      const res = await axios.get(`${API_URL}/ward`, {
        params: { district_id: districtId },
        headers: { token: GHN_TOKEN }
      });
      const data = res.data.data || [];
      return data.filter((item: any) => !item.WardName.toLowerCase().includes('test') && !item.WardName.toLowerCase().includes('alert'));
    } catch (e) {
      console.error('Lỗi lấy phường/xã', e);
      return [];
    }
  }
};
