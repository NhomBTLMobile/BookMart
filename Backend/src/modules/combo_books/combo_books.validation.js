import Joi from 'joi'

export const createComboBooksSchema = Joi.object({
  quantity: Joi.number().integer().allow(null, ''),
})

export const updateComboBooksSchema = Joi.object({
  quantity: Joi.number().integer().allow(null, ''),
}).min(1)

