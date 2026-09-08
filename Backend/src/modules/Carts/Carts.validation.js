import Joi from 'joi'

export const createCartsSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
})

export const updateCartsSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
}).min(1)

