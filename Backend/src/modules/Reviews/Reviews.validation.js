import Joi from 'joi'

export const createReviewsSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  book_id: Joi.string().uuid().required(),
  order_id: Joi.string().uuid().required(),
  rating: Joi.number().integer().required(),
  comment: Joi.string().allow(null, ''),
})

export const updateReviewsSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  book_id: Joi.string().uuid().allow(null, ''),
  order_id: Joi.string().uuid().allow(null, ''),
  rating: Joi.number().integer().allow(null, ''),
  comment: Joi.string().allow(null, ''),
}).min(1)

