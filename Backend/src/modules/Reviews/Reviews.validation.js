import Joi from 'joi'

export const createReviewsSchema = Joi.object({
  book_id: Joi.string().uuid().allow(null, ''),
  user_id: Joi.string().uuid().allow(null, ''),
  order_item_id: Joi.string().uuid().allow(null, ''),
  rating: Joi.number().integer().required(),
  body: Joi.string().allow(null, ''),
  is_verified: Joi.boolean().allow(null, ''),
})

export const updateReviewsSchema = Joi.object({
  book_id: Joi.string().uuid().allow(null, ''),
  user_id: Joi.string().uuid().allow(null, ''),
  order_item_id: Joi.string().uuid().allow(null, ''),
  rating: Joi.number().integer().allow(null, ''),
  body: Joi.string().allow(null, ''),
  is_verified: Joi.boolean().allow(null, ''),
}).min(1)

