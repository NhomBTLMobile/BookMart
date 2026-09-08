import Joi from 'joi'

export const createBooksSchema = Joi.object({
  title: Joi.string().required(),
  publisher: Joi.string().allow(null, ''),
  publish_year: Joi.number().integer().allow(null, ''),
  description: Joi.string().allow(null, ''),
  price: Joi.number().integer().required(),
  stock: Joi.number().integer().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
})

export const updateBooksSchema = Joi.object({
  title: Joi.string().allow(null, ''),
  publisher: Joi.string().allow(null, ''),
  publish_year: Joi.number().integer().allow(null, ''),
  description: Joi.string().allow(null, ''),
  price: Joi.number().integer().allow(null, ''),
  stock: Joi.number().integer().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
}).min(1)

