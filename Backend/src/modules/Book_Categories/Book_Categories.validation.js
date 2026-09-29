import Joi from 'joi'

export const createBookCategoriesSchema = Joi.object({
  category_id: Joi.number().integer().required(),
  is_primary: Joi.boolean().allow(null, ''),
})

export const updateBookCategoriesSchema = Joi.object({
  is_primary: Joi.boolean().allow(null, ''),
}).min(1)

