import Joi from 'joi'

export const createVouchersSchema = Joi.object({
  code: Joi.string().required(),
  discount_type: Joi.string().required(),
  discount_value: Joi.number().integer().required(),
  min_order_value: Joi.number().integer().allow(null, ''),
  max_discount_amount: Joi.number().integer().allow(null, ''),
  usage_limit: Joi.number().integer().allow(null, ''),
  used_count: Joi.number().integer().allow(null, ''),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
})

export const updateVouchersSchema = Joi.object({
  code: Joi.string().allow(null, ''),
  discount_type: Joi.string().allow(null, ''),
  discount_value: Joi.number().integer().allow(null, ''),
  min_order_value: Joi.number().integer().allow(null, ''),
  max_discount_amount: Joi.number().integer().allow(null, ''),
  usage_limit: Joi.number().integer().allow(null, ''),
  used_count: Joi.number().integer().allow(null, ''),
  start_date: Joi.date().allow(null, ''),
  end_date: Joi.date().allow(null, ''),
}).min(1)

