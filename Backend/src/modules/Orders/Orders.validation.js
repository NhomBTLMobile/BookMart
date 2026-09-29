import Joi from 'joi'

export const createOrdersSchema = Joi.object({
  order_code: Joi.string().required(),
  user_id: Joi.string().uuid().allow(null, ''),
  address_id: Joi.string().uuid().allow(null, ''),
  shipping_snapshot: Joi.object().required(),
  subtotal: Joi.number().required(),
  shipping_fee: Joi.number(),
  discount_amount: Joi.number().allow(null, ''),
  points_discount: Joi.number().allow(null, ''),
  total_amount: Joi.number().required(),
  voucher_id: Joi.string().uuid().allow(null, ''),
  points_used: Joi.number().integer().allow(null, ''),
  payment_method: Joi.string().required(),
  payment_status: Joi.string().allow(null, ''),
  order_status: Joi.string().allow(null, ''),
})

export const updateOrdersSchema = Joi.object({
  order_code: Joi.string().allow(null, ''),
  user_id: Joi.string().uuid().allow(null, ''),
  address_id: Joi.string().uuid().allow(null, ''),
  shipping_snapshot: Joi.object().allow(null, ''),
  subtotal: Joi.number().allow(null, ''),
  shipping_fee: Joi.number().allow(null, ''),
  discount_amount: Joi.number().allow(null, ''),
  points_discount: Joi.number().allow(null, ''),
  total_amount: Joi.number().allow(null, ''),
  voucher_id: Joi.string().uuid().allow(null, ''),
  points_used: Joi.number().integer().allow(null, ''),
  payment_method: Joi.string().allow(null, ''),
  payment_status: Joi.string().allow(null, ''),
  order_status: Joi.string().allow(null, ''),
}).min(1)

