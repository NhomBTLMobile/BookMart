import Joi from 'joi'

export const createBook_ImagesSchema = Joi.object({
  book_id: Joi.string().uuid().required(),
  image_url: Joi.string().required(),
  is_primary: Joi.boolean().allow(null, ''),
})

export const updateBook_ImagesSchema = Joi.object({
  book_id: Joi.string().uuid().allow(null, ''),
  image_url: Joi.string().allow(null, ''),
  is_primary: Joi.boolean().allow(null, ''),
}).min(1)

