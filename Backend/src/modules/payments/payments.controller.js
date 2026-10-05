import { PaymentsService } from './payments.service.js'
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js'
import { getPagination, getPaginationMeta } from '../../utils/pagination.js'
import { createPaymentsSchema, updatePaymentsSchema } from './payments.validation.js'
import { generateVnpayUrl, verifyVnpayReturn } from '../../utils/vnpay.js'
import { OrdersService } from '../orders/orders.service.js'

const service = new PaymentsService()
const ordersService = new OrdersService()

import fs from 'fs';
import path from 'path';

// Lưu tạm thông tin checkout vào file json để không bị mất khi nodemon restart
const PENDING_FILE = path.join(process.cwd(), '.pending_checkouts.json');

const getPendingCheckouts = () => {
  try {
    if (fs.existsSync(PENDING_FILE)) {
      return JSON.parse(fs.readFileSync(PENDING_FILE, 'utf-8'));
    }
  } catch(e) {}
  return {};
};

const savePendingCheckout = (orderId, payload) => {
  const data = getPendingCheckouts();
  data[orderId] = { payload, expiresAt: Date.now() + 15 * 60 * 1000 };
  fs.writeFileSync(PENDING_FILE, JSON.stringify(data));
};

const getPendingCheckout = (orderId) => {
  const data = getPendingCheckouts();
  const item = data[orderId];
  if (item && item.expiresAt > Date.now()) {
    return item.payload;
  }
  return null;
};

const deletePendingCheckout = (orderId) => {
  const data = getPendingCheckouts();
  if (data[orderId]) {
    delete data[orderId];
    fs.writeFileSync(PENDING_FILE, JSON.stringify(data));
  }
};

export const getAll = async (req, res, next) => {
  try {
    const pagination = getPagination(req.query)
    const { total, data } = await service.getAll({ ...pagination, search: req.query.search })
    const meta = getPaginationMeta(total, pagination.page, pagination.limit)
    sendSuccess(res, 'Lấy danh sách thành công', data, meta)
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
    const { error, value } = createPaymentsSchema.validate(req.body)
    if (error) return sendError(res, error.details[0].message, 400)
    const data = await service.create(value)
    sendCreated(res, 'Tạo thành công', data)
  } catch (err) { next(err) }
}

export const update = async (req, res, next) => {
  try {
    const { error, value } = updatePaymentsSchema.validate(req.body)
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

export const createVnpayUrl = async (req, res, next) => {
  try {
    const { amount, order_info, return_url, app_redirect, checkoutPayload } = req.body;
    let order_id = req.body.order_id;
    if (!amount) return sendError(res, 'Thiếu thông tin thanh toán', 400);

    // Nếu App truyền payload (chưa tạo đơn), ta tạo order_code và lưu tạm vào bộ nhớ
    if (checkoutPayload) {
      order_id = `BM${Date.now().toString(36).toUpperCase()}`;
      checkoutPayload.order_code = order_id;
      savePendingCheckout(order_id, checkoutPayload);
    }

    if (!order_id) return sendError(res, 'Thiếu mã đơn hàng', 400);

    let returnUrl = return_url || process.env.VNP_RETURN_URL || 'http://localhost:3000/api/payments/vnpay_return';
    const redirectParam = app_redirect || req.query.app_redirect;
    if (redirectParam) {
      returnUrl += `?app_redirect=${encodeURIComponent(redirectParam)}`;
    }
    
    const url = generateVnpayUrl(req, order_id, amount, order_info || 'Thanh toan don hang', returnUrl);
    
    sendSuccess(res, 'Tạo URL thành công', { payment_url: url, order_code: order_id });
  } catch (err) { next(err) }
}

export const vnpayReturn = async (req, res, next) => {
  try {
    let vnp_Params = req.query;
    const isValid = verifyVnpayReturn(vnp_Params);
    
    // Xử lý chuyển hướng lại Mobile App (Sử dụng Deep link)
    const appRedirect = vnp_Params.app_redirect || 'bookmart://payment-result';
    
    if (isValid) {
      const responseCode = vnp_Params['vnp_ResponseCode'];
      const orderCode = vnp_Params['vnp_TxnRef'];
      
      if (responseCode === '00') {
        // 1. Kiểm tra xem đơn hàng có trong file tạm không
        const payload = getPendingCheckout(orderCode);
        if (payload) {
          payload.payment_status = 'paid';
          payload.order_status = 'pending';
          try {
            await ordersService.create(payload);
            deletePendingCheckout(orderCode);
          } catch (e) {
            console.error('[VNPAY CREATE ORDER ERROR]:', e);
            import('fs').then(fs => fs.writeFileSync('vnpay_error.log', JSON.stringify({ message: e.message, stack: e.stack, payload })));
            // Nếu lưu DB lỗi, coi như thất bại để user biết
            return res.redirect(`${appRedirect}?status=failed&orderId=${orderCode}`);
          }
        } else {
          // 2. Nếu không có trong file tạm, có thể đơn đã được tạo (Thanh toán lại)
          const order = await ordersService.getByOrderCode(orderCode).catch(() => null);
          if (order) {
            await ordersService.update(order.id, { payment_status: 'paid' }).catch(() => {});
          } else {
            // Không tìm thấy payload, cũng không có trong DB -> Có thể Backend bị khởi động lại làm mất bộ nhớ
            return res.redirect(`${appRedirect}?status=failed&orderId=${orderCode}&reason=lost_memory`);
          }
        }
      } else {
        // Thất bại -> Xóa khỏi file tạm
        deletePendingCheckout(orderCode);
      }
      
      if (responseCode === '00') {
        res.redirect(`${appRedirect}?status=success&orderId=${orderCode}`);
      } else {
        res.redirect(`${appRedirect}?status=failed&orderId=${orderCode}`);
      }
    } else {
      res.redirect(`${appRedirect}?status=invalid`);
    }
  } catch (err) { next(err) }
}

export const vnpayIpn = async (req, res, next) => {
  try {
    let vnp_Params = req.query;
    const isValid = verifyVnpayReturn(vnp_Params);
    if (isValid) {
      const orderCode = vnp_Params['vnp_TxnRef'];
      const rspCode = vnp_Params['vnp_ResponseCode'];
      
      if (rspCode === '00') {
         const payload = getPendingCheckout(orderCode);
         if (payload) {
           payload.payment_status = 'paid';
           payload.order_status = 'pending';
           await ordersService.create(payload).catch(console.error);
           deletePendingCheckout(orderCode);
         } else {
           const order = await ordersService.getByOrderCode(orderCode).catch(() => null);
           if (order) {
             await ordersService.update(order.id, { payment_status: 'paid' });
           }
         }
      } else {
         deletePendingCheckout(orderCode);
      }

      res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
  } catch (err) { 
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
}


