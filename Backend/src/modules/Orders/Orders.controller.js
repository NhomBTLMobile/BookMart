import { OrdersService } from './orders.service.js'
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js'
import { getPagination, getPaginationMeta } from '../../utils/pagination.js'
import { createOrdersSchema, updateOrdersSchema } from './orders.validation.js'

const service = new OrdersService()

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

