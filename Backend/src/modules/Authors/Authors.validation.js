import Joi from 'joi'

export const createAuthorsSchema = Joi.object({
  name: Joi.string().required(),
  bio: Joi.string().allow(null, ''),
  avatar_url: Joi.string().allow(null, ''),
})

export const updateAuthorsSchema = Joi.object({
  name: Joi.string().allow(null, ''),
  bio: Joi.string().allow(null, ''),
  avatar_url: Joi.string().allow(null, ''),
}).min(1)

