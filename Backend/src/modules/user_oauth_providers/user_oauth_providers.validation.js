import Joi from 'joi'

export const createUserOauthProvidersSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  provider: Joi.string().required(),
  provider_uid: Joi.string().required(),
  access_token: Joi.string().allow(null, ''),
})

export const updateUserOauthProvidersSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  provider: Joi.string().allow(null, ''),
  provider_uid: Joi.string().allow(null, ''),
  access_token: Joi.string().allow(null, ''),
}).min(1)

