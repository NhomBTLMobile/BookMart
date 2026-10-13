import { OrdersService } from './orders.service.js'
import { calculateGHNFee as ghnCalculateFee, getGHNProvinces, getGHNDistricts, getGHNWards } from '../../utils/ghn.js'
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js'
import { getPagination, getPaginationMeta } from '../../utils/pagination.js'
import { createOrdersSchema, updateOrdersSchema } from './orders.validation.js'
import { sequelize } from '../../config/database.js'

const service = new OrdersService()

export const getAll = async (req, res, next) => {
  try {
    const pagination = getPagination(req.query)
    const { total, data } = await service.getAll({ ...pagination, search: req.query.search })
    const meta = getPaginationMeta(total, pagination.page, pagination.limit)
    sendSuccess(res, 'Lấy danh sách thành công', data, meta)
  } catch (err) { next(err) }
}

export const getMyOrders = async (req, res, next) => {
  try {
    const data = await service.getByUserId(req.user.id)
    sendSuccess(res, 'Lấy danh sách đơn hàng thành công', data)
  } catch (err) { next(err) }
}

export const getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    let data;
    // Kiểm tra nếu là UUID thì dùng getById, nếu là orderCode thì dùng getByOrderCode
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      data = await service.getById(id);
    } else {
      data = await service.getByOrderCode(id);
    }
    sendSuccess(res, 'Lấy thông tin thành công', data)
  } catch (err) { next(err) }
}

export const create = async (req, res, next) => {
  try {
    const { error, value } = createOrdersSchema.validate(req.body)
    if (error) return sendError(res, error.details[0].message, 400)
    const data = await service.create(value)
    sendCreated(res, 'Tạo thành công', data)
  } catch (err) { next(err) }
}

export const update = async (req, res, next) => {
  try {
    const { error, value } = updateOrdersSchema.validate(req.body)
    if (error) return sendError(res, error.details[0].message, 400)
    const data = await service.update(req.params.id, value)
    sendSuccess(res, 'Cập nhật thành công', data)
  } catch (err) { next(err) }
}

export const remove = async (req, res, next) => {
  try {
    await service.delete(req.params.id)
    sendSuccess(res, 'Xóa thành công')
  } catch (err) { next(err) }
}

export const cancelOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    let order;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      order = await service.getById(id);
    } else {
      order = await service.getByOrderCode(id);
    }

    if (!order) {
      return sendError(res, 'Không tìm thấy đơn hàng', 404);
    }

    // Kiểm tra quyền (chủ đơn hàng hoặc admin)
    if (req.user && req.user.role !== 'admin' && order.user_id && order.user_id !== req.user.id) {
      return sendError(res, 'Bạn không có quyền thao tác trên đơn hàng này', 403);
    }

    const currentStatus = (order.order_status || '').toLowerCase();
    if (currentStatus === 'cancelled') {
      return sendError(res, 'Đơn hàng này đã được hủy trước đó', 400);
    }

    if (currentStatus !== 'pending') {
      return sendError(res, 'Chỉ có thể hủy đơn hàng khi ở trạng thái "Chờ xử lý"', 400);
    }

    const updatePayload = {
      order_status: 'cancelled',
    };
    if (order.payment_status === 'paid') {
      updatePayload.payment_status = 'refunded';
    }

    const updated = await service.update(order.id, updatePayload);
    sendSuccess(res, 'Hủy đơn hàng thành công', updated);
  } catch (err) { next(err) }
}

export const createGHN = async (req, res, next) => {
  try {
    const data = await service.createGHNShipping(req.params.id, req.body)
    sendSuccess(res, 'Tạo đơn GHN thành công', data)
  } catch (err) { next(err) }
}

export const ghnWebhook = async (req, res, next) => {
  try {
    console.log("🔔 [WEBHOOK] Nhận tín hiệu từ GHN:", req.body.OrderCode, "-", req.body.Status);
    await service.handleGHNWebhook(req.body);
    // Luôn trả về 200 để xác nhận đã nhận Webhook thành công với GHN
    res.status(200).send('OK');
  } catch (err) { 
    console.error("GHN Webhook Error:", err);
    res.status(200).send('OK'); 
  }
}

export const calculateFee = async (req, res, next) => {
  try {
    const { to_district_id, to_ward_code, items } = req.body;
    if (!to_district_id || !to_ward_code) {
      return sendError(res, "Thiếu thông tin địa chỉ để tính phí", 400);
    }
    
    let totalWeight = 0;
    let maxLen = 20;
    let maxWid = 15;
    let totalHeight = 0;
    let itemCount = 0;

    if (items && Array.isArray(items) && items.length > 0) {
      const bookIds = items.map(it => it.id);
      const query = `
        SELECT id, weight_grams, length_cm, width_cm, height_cm 
        FROM books 
        WHERE id IN (:bookIds)
      `;
      const [rows] = await sequelize.query(query, {
        replacements: { bookIds }
      });
      
      for (const it of items) {
        const book = rows.find(r => r.id === it.id);
        const qty = it.quantity || 1;
        itemCount += qty;
        
        if (book) {
          totalWeight += (book.weight_grams || 250) * qty;
          maxLen = Math.max(maxLen, book.length_cm || 20);
          maxWid = Math.max(maxWid, book.width_cm || 15);
          totalHeight += (book.height_cm || 2) * qty;
        } else {
          totalWeight += 250 * qty;
          totalHeight += 2 * qty;
        }
      }
    } else {
      // Fallback
      itemCount = 1;
      totalWeight = 250;
      totalHeight = 2;
    }

    const feeData = {
      service_type_id: 2,
      from_district_id: parseInt(process.env.GHN_FROM_DISTRICT_ID || '1717', 10),
      from_ward_code: process.env.GHN_FROM_WARD_CODE || '220208',
      to_district_id: parseInt(to_district_id, 10),
      to_ward_code: String(to_ward_code),
      height: Math.max(2, totalHeight),
      length: maxLen,
      weight: Math.max(10, totalWeight),
      width: maxWid
    };

    let feeResult = null;
    try {
      const ghnRes = await ghnCalculateFee(feeData);
      // Sử dụng cước phí thực tế từ API Thật của GHN
      if (ghnRes && ghnRes.data && (ghnRes.data.total !== undefined || ghnRes.data.service_fee !== undefined)) {
        feeResult = ghnRes.data;
      }
    } catch (ghnErr) {
      console.warn("GHN API Thật chưa phản hồi (kiểm tra lại GHN_TOKEN trong file .env):", ghnErr.message);
      // Fallback tính phí dự phòng nếu token trong .env chưa đúng hoặc mất kết nối
      const baseFee = 25000;
      const extraWeightFee = totalWeight > 1000 ? Math.ceil((totalWeight - 1000) / 500) * 5000 : 0;
      const total = baseFee + extraWeightFee;
      feeResult = {
        total,
        service_fee: total
      };
    }

    sendSuccess(res, 'Tính phí thành công', feeResult);
  } catch (err) { next(err) }
}

export const getProvinces = async (req, res, next) => {
  try {
    const data = await getGHNProvinces();
    const filtered = (data || []).filter(item => 
      !item.ProvinceName?.toLowerCase().includes('test') && 
      !item.ProvinceName?.toLowerCase().includes('alert')
    );
    if (filtered.length > 0) {
      return sendSuccess(res, 'Lấy danh sách tỉnh/thành thành công', filtered);
    }
    throw new Error('Danh sách trống');
  } catch (err) {
    console.warn("Lỗi lấy tỉnh/thành từ GHN API Thật (hãy kiểm tra GHN_TOKEN trong .env):", err.message);
    // Danh sách dự phòng nếu GHN_TOKEN chưa điền vào .env
    sendSuccess(res, 'Lấy danh sách tỉnh/thành', [
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
      { ProvinceID: 220, ProvinceName: 'Lâm Đồng' }
    ]);
  }
};

export const getDistricts = async (req, res, next) => {
  try {
    const provinceId = req.query.province_id;
    if (!provinceId) return sendSuccess(res, 'Thiếu province_id', []);
    const data = await getGHNDistricts(provinceId);
    const filtered = (data || []).filter(item => 
      !item.DistrictName?.toLowerCase().includes('test') && 
      !item.DistrictName?.toLowerCase().includes('alert')
    );
    if (filtered.length > 0) {
      return sendSuccess(res, 'Lấy danh sách quận/huyện thành công', filtered);
    }
    throw new Error('Danh sách trống');
  } catch (err) {
    console.warn("Lỗi lấy quận/huyện từ GHN API Thật (hãy kiểm tra GHN_TOKEN trong .env):", err.message);
    const pId = Number(req.query.province_id) || 201;
    sendSuccess(res, 'Lấy danh sách quận/huyện', [
      { DistrictID: 1442, DistrictName: 'Quận Ba Đình', ProvinceID: pId },
      { DistrictID: 1443, DistrictName: 'Quận Cầu Giấy', ProvinceID: pId },
      { DistrictID: 1444, DistrictName: 'Quận Đống Đa', ProvinceID: pId },
      { DistrictID: 1482, DistrictName: 'Quận Hoàn Kiếm', ProvinceID: pId },
      { DistrictID: 1717, DistrictName: 'Huyện Hoài Đức', ProvinceID: pId },
      { DistrictID: 1446, DistrictName: 'Quận 1', ProvinceID: pId },
      { DistrictID: 1447, DistrictName: 'Quận 3', ProvinceID: pId },
      { DistrictID: 1450, DistrictName: 'Quận 7', ProvinceID: pId },
      { DistrictID: 1452, DistrictName: 'Thành phố Thủ Đức', ProvinceID: pId },
    ]);
  }
};

export const getWards = async (req, res, next) => {
  try {
    const districtId = req.query.district_id;
    if (!districtId) return sendSuccess(res, 'Thiếu district_id', []);
    const data = await getGHNWards(districtId);
    const filtered = (data || []).filter(item => 
      !item.WardName?.toLowerCase().includes('test') && 
      !item.WardName?.toLowerCase().includes('alert')
    );
    if (filtered.length > 0) {
      return sendSuccess(res, 'Lấy danh sách phường/xã thành công', filtered);
    }
    throw new Error('Danh sách trống');
  } catch (err) {
    console.warn("Lỗi lấy phường/xã từ GHN API Thật (hãy kiểm tra GHN_TOKEN trong .env):", err.message);
    const dId = Number(req.query.district_id) || 1443;
    sendSuccess(res, 'Lấy danh sách phường/xã', [
      { WardCode: '20101', WardName: 'Phường Dịch Vọng', DistrictID: dId },
      { WardCode: '20102', WardName: 'Phường Dịch Vọng Hậu', DistrictID: dId },
      { WardCode: '220208', WardName: 'Xã An Khánh', DistrictID: dId },
      { WardCode: '20301', WardName: 'Phường Bến Nghé', DistrictID: dId },
      { WardCode: '1A0101', WardName: 'Phường Phúc Xá', DistrictID: dId },
    ]);
  }
};

