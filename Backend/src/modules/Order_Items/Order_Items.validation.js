import Joi from 'joi'

export const createOrderItemsSchema = Joi.object({
  order_id: Joi.string().uuid().allow(null, ''),
  book_id: Joi.string().uuid().allow(null, ''),
  combo_id: Joi.string().uuid().allow(null, ''),
  item_name: Joi.string().required(),
  unit_price: Joi.number().required(),
  quantity: Joi.number().integer().required(),
  total_price: Joi.number().required(),
})

export const updateOrderItemsSchema = Joi.object({
  order_id: Joi.string().uuid().allow(null, ''),
  book_id: Joi.string().uuid().allow(null, ''),
  combo_id: Joi.string().uuid().allow(null, ''),
  item_name: Joi.string().allow(null, ''),
  unit_price: Joi.number().allow(null, ''),
  quantity: Joi.number().integer().allow(null, ''),
  total_price: Joi.number().allow(null, ''),
}).min(1)

