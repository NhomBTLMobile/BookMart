import { PaymentsService } from './payments.service.js'
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js'
import { getPagination, getPaginationMeta } from '../../utils/pagination.js'
import { createPaymentsSchema, updatePaymentsSchema } from './payments.validation.js'
import { generateVnpayUrl, verifyVnpayReturn } from '../../utils/vnpay.js'
import { OrdersService } from '../orders/orders.service.js'

const service = new PaymentsService()
const ordersService = new OrdersService()

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
    const { order_id, amount, order_info, return_url, app_redirect } = req.body;
    if (!order_id || !amount) return sendError(res, 'Thiếu thông tin thanh toán', 400);

    let returnUrl = return_url || process.env.VNP_RETURN_URL || 'http://localhost:3000/api/payments/vnpay_return';
    const redirectParam = app_redirect || req.query.app_redirect;
    if (redirectParam) {
      returnUrl += `?app_redirect=${encodeURIComponent(redirectParam)}`;
    }
    
    const url = generateVnpayUrl(req, order_id, amount, order_info || 'Thanh toan don hang', returnUrl);
    
    sendSuccess(res, 'Tạo URL thành công', { payment_url: url });
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
      
      // Lấy order bằng orderCode thay vì id
      const order = await ordersService.getByOrderCode(orderCode).catch(() => null);
      
      // Đồng thời cập nhật trạng thái đơn hàng (để tránh trường hợp IPN chậm/không gọi được ở dev env)
      if (order) {
        if (responseCode === '00') {
           await ordersService.update(order.id, { payment_status: 'paid' }).catch(() => {});
        } else {
           await ordersService.update(order.id, { payment_status: 'failed' }).catch(() => {});
        }
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
      
      const order = await ordersService.getByOrderCode(orderCode).catch(() => null);
      if (!order) return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
      
      // Kiểm tra số tiền
      if (Number(order.total_amount) !== Number(vnp_Params['vnp_Amount']) / 100) {
         return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
      }
      
      if (order.payment_status === 'paid') {
         return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
      }

      if (rspCode === '00') {
         await ordersService.update(order.id, { payment_status: 'paid' });
      } else {
         await ordersService.update(order.id, { payment_status: 'failed' });
      }

      res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
  } catch (err) { 
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
}


