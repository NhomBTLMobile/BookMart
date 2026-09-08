import Joi from 'joi'

export const createCart_ItemsSchema = Joi.object({
  cart_id: Joi.string().uuid().required(),
  book_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().required(),
})

export const updateCart_ItemsSchema = Joi.object({
  cart_id: Joi.string().uuid().allow(null, ''),
  book_id: Joi.string().uuid().allow(null, ''),
  quantity: Joi.number().integer().allow(null, ''),
}).min(1)

