import Joi from 'joi'

export const createBookImagesSchema = Joi.object({
  book_id: Joi.string().uuid().allow(null, ''),
  image_url: Joi.string().required(),
  sort_order: Joi.number().integer().allow(null, ''),
})

export const updateBookImagesSchema = Joi.object({
  book_id: Joi.string().uuid().allow(null, ''),
  image_url: Joi.string().allow(null, ''),
  sort_order: Joi.number().integer().allow(null, ''),
}).min(1)

