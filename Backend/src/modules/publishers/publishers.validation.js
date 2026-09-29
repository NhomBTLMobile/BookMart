import Joi from 'joi'

export const createPublishersSchema = Joi.object({
  name: Joi.string().required(),
})

export const updatePublishersSchema = Joi.object({
  name: Joi.string().allow(null, ''),
}).min(1)

