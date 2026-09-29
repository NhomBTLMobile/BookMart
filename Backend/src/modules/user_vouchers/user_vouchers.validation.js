import Joi from 'joi'

export const createUserVouchersSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  voucher_id: Joi.string().uuid().allow(null, ''),
  is_used: Joi.boolean().allow(null, ''),
})

export const updateUserVouchersSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  voucher_id: Joi.string().uuid().allow(null, ''),
  is_used: Joi.boolean().allow(null, ''),
}).min(1)

