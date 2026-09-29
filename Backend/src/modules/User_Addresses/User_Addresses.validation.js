import Joi from 'joi'

export const createUserAddressesSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  label: Joi.string().allow(null, ''),
  recipient_name: Joi.string().required(),
  phone: Joi.string().required(),
  province_id: Joi.number().integer().required(),
  province_name: Joi.string().required(),
  district_id: Joi.number().integer().required(),
  district_name: Joi.string().required(),
  ward_code: Joi.string().required(),
  ward_name: Joi.string().required(),
  street_address: Joi.string().required(),
  is_default: Joi.boolean().allow(null, ''),
})

export const updateUserAddressesSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  label: Joi.string().allow(null, ''),
  recipient_name: Joi.string().allow(null, ''),
  phone: Joi.string().allow(null, ''),
  province_id: Joi.number().integer().allow(null, ''),
  province_name: Joi.string().allow(null, ''),
  district_id: Joi.number().integer().allow(null, ''),
  district_name: Joi.string().allow(null, ''),
  ward_code: Joi.string().allow(null, ''),
  ward_name: Joi.string().allow(null, ''),
  street_address: Joi.string().allow(null, ''),
  is_default: Joi.boolean().allow(null, ''),
}).min(1)

