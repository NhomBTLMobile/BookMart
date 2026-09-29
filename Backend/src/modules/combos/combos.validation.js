import Joi from 'joi'

export const createCombosSchema = Joi.object({
  name: Joi.string().required(),
  cover_image_url: Joi.string().allow(null, ''),
  original_total: Joi.number().required(),
  combo_price: Joi.number().required(),
  stock_qty: Joi.number().integer().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
  ends_at: Joi.date().allow(null, ''),
})

export const updateCombosSchema = Joi.object({
  name: Joi.string().allow(null, ''),
  cover_image_url: Joi.string().allow(null, ''),
  original_total: Joi.number().allow(null, ''),
  combo_price: Joi.number().allow(null, ''),
  stock_qty: Joi.number().integer().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
  ends_at: Joi.date().allow(null, ''),
}).min(1)

