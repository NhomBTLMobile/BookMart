import Joi from 'joi'

export const createVouchersSchema = Joi.object({
  code: Joi.string().required(),
  type: Joi.string().required(),
  value: Joi.number().required(),
  max_discount: Joi.number().allow(null, ''),
  min_order_value: Joi.number().allow(null, ''),
  usage_limit: Joi.number().integer().allow(null, ''),
  used_count: Joi.number().integer().allow(null, ''),
  ends_at: Joi.date().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
})

export const updateVouchersSchema = Joi.object({
  code: Joi.string().allow(null, ''),
  type: Joi.string().allow(null, ''),
  value: Joi.number().allow(null, ''),
  max_discount: Joi.number().allow(null, ''),
  min_order_value: Joi.number().allow(null, ''),
  usage_limit: Joi.number().integer().allow(null, ''),
  used_count: Joi.number().integer().allow(null, ''),
  ends_at: Joi.date().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
}).min(1)

