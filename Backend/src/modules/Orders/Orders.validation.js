import Joi from 'joi'

export const createOrdersSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  address_id: Joi.string().uuid().required(),
  voucher_id: Joi.string().uuid().allow(null, ''),
  total_price: Joi.number().integer().required(),
  discount_price: Joi.number().integer().allow(null, ''),
  final_price: Joi.number().integer().required(),
  payment_method: Joi.string().required(),
  payment_status: Joi.string().allow(null, ''),
  order_status: Joi.string().allow(null, ''),
  vnpay_tran_no: Joi.string().allow(null, ''),
})

export const updateOrdersSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  address_id: Joi.string().uuid().allow(null, ''),
  voucher_id: Joi.string().uuid().allow(null, ''),
  total_price: Joi.number().integer().allow(null, ''),
  discount_price: Joi.number().integer().allow(null, ''),
  final_price: Joi.number().integer().allow(null, ''),
  payment_method: Joi.string().allow(null, ''),
  payment_status: Joi.string().allow(null, ''),
  order_status: Joi.string().allow(null, ''),
  vnpay_tran_no: Joi.string().allow(null, ''),
}).min(1)

