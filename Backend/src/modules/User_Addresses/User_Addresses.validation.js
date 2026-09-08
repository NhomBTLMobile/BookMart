import Joi from 'joi'

export const createUser_AddressesSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  receiver_name: Joi.string().required(),
  phone_number: Joi.string().required(),
  address_detail: Joi.string().required(),
  is_default: Joi.boolean().allow(null, ''),
})

export const updateUser_AddressesSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  receiver_name: Joi.string().allow(null, ''),
  phone_number: Joi.string().allow(null, ''),
  address_detail: Joi.string().allow(null, ''),
  is_default: Joi.boolean().allow(null, ''),
}).min(1)

