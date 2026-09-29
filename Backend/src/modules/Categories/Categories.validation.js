import Joi from 'joi'

export const createCategoriesSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  icon_url: Joi.string().allow(null, ''),
  sort_order: Joi.number().integer().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
})

export const updateCategoriesSchema = Joi.object({
  name: Joi.string().allow(null, ''),
  slug: Joi.string().allow(null, ''),
  icon_url: Joi.string().allow(null, ''),
  sort_order: Joi.number().integer().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
}).min(1)

