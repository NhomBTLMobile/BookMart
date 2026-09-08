import Joi from 'joi'

export const createOrder_ItemsSchema = Joi.object({
  order_id: Joi.string().uuid().required(),
  book_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().required(),
  unit_price: Joi.number().integer().required(),
})

export const updateOrder_ItemsSchema = Joi.object({
  order_id: Joi.string().uuid().allow(null, ''),
  book_id: Joi.string().uuid().allow(null, ''),
  quantity: Joi.number().integer().allow(null, ''),
  unit_price: Joi.number().integer().allow(null, ''),
}).min(1)

