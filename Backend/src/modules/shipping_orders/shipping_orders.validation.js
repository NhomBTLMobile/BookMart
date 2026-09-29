import Joi from 'joi'

export const createShippingOrdersSchema = Joi.object({
  order_id: Joi.string().uuid().allow(null, ''),
  provider_order_id: Joi.string().allow(null, ''),
  tracking_code: Joi.string().allow(null, ''),
  shipping_status: Joi.string().allow(null, ''),
  fee: Joi.number().allow(null, ''),
  expected_date: Joi.date().allow(null, ''),
})

export const updateShippingOrdersSchema = Joi.object({
  order_id: Joi.string().uuid().allow(null, ''),
  provider_order_id: Joi.string().allow(null, ''),
  tracking_code: Joi.string().allow(null, ''),
  shipping_status: Joi.string().allow(null, ''),
  fee: Joi.number().allow(null, ''),
  expected_date: Joi.date().allow(null, ''),
}).min(1)

