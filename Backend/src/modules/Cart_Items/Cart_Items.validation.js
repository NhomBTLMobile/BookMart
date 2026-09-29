import Joi from 'joi'

export const createCartItemsSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  book_id: Joi.string().uuid().allow(null, ''),
  combo_id: Joi.string().uuid().allow(null, ''),
  quantity: Joi.number().integer(),
  added_at: Joi.date().allow(null, ''),
})

export const updateCartItemsSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  book_id: Joi.string().uuid().allow(null, ''),
  combo_id: Joi.string().uuid().allow(null, ''),
  quantity: Joi.number().integer().allow(null, ''),
  added_at: Joi.date().allow(null, ''),
}).min(1)

