import Joi from 'joi'

export const createBookAuthorsSchema = Joi.object({
  author_id: Joi.number().integer().required(),
  role: Joi.string().allow(null, ''),
})

export const updateBookAuthorsSchema = Joi.object({
  role: Joi.string().allow(null, ''),
}).min(1)

