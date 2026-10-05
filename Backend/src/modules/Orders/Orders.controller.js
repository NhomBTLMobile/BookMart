import { OrdersService } from './orders.service.js'
import { calculateGHNFee as ghnCalculateFee } from '../../utils/ghn.js'
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
    const data = await service.getById(req.params.id)
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

    const ghnRes = await ghnCalculateFee(feeData);
    
    // ĐIỀU CHỈNH MÔI TRƯỜNG DEV: Giảm cước gốc của API Test theo tỷ lệ phần trăm
    // Mức phí Dev thường cao gấp đôi thực tế, ta nhân với hệ số 0.48 (tương đương 48% giá dev)
    // Cách này giúp giá nhảy cực kỳ chuẩn xác theo khoảng cách và cân nặng thực.
    if (ghnRes && ghnRes.data && ghnRes.data.total) {
      let adjustedFee = Math.round((ghnRes.data.total * 0.48) / 100) * 100;
      
      // Chốt chặn nhỏ nhất
      if (adjustedFee < 15500) adjustedFee = 15500;
      
      ghnRes.data.total = adjustedFee;
      if (ghnRes.data.service_fee) {
        ghnRes.data.service_fee = adjustedFee;
      }
    }

    sendSuccess(res, 'Tính phí thành công', ghnRes.data);
  } catch (err) { next(err) }
}

