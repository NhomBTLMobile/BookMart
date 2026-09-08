import Joi from 'joi'

export const createCategoriesSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(null, ''),
})

export const updateCategoriesSchema = Joi.object({
  name: Joi.string().allow(null, ''),
  description: Joi.string().allow(null, ''),
}).min(1)

