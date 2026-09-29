import Joi from 'joi'

export const createUsersSchema = Joi.object({
  email: Joi.string().required(),
  phone: Joi.string().allow(null, ''),
  password_hash: Joi.string().allow(null, ''),
  full_name: Joi.string().required(),
  avatar_url: Joi.string().allow(null, ''),
  role: Joi.string().allow(null, ''),
  loyalty_points: Joi.number().integer().allow(null, ''),
  user_vector: Joi.object().allow(null, ''),
  is_verified: Joi.boolean().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
})

export const updateUsersSchema = Joi.object({
  email: Joi.string().allow(null, ''),
  phone: Joi.string().allow(null, ''),
  password_hash: Joi.string().allow(null, ''),
  full_name: Joi.string().allow(null, ''),
  avatar_url: Joi.string().allow(null, ''),
  role: Joi.string().allow(null, ''),
  loyalty_points: Joi.number().integer().allow(null, ''),
  user_vector: Joi.object().allow(null, ''),
  is_verified: Joi.boolean().allow(null, ''),
  is_active: Joi.boolean().allow(null, ''),
}).min(1)

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})
