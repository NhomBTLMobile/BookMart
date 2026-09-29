import Joi from 'joi'

export const createLoyaltyPointsLedgerSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  delta: Joi.number().integer().required(),
  balance_after: Joi.number().integer().required(),
  type: Joi.string().required(),
  ref_id: Joi.string().uuid().allow(null, ''),
})

export const updateLoyaltyPointsLedgerSchema = Joi.object({
  user_id: Joi.string().uuid().allow(null, ''),
  delta: Joi.number().integer().allow(null, ''),
  balance_after: Joi.number().integer().allow(null, ''),
  type: Joi.string().allow(null, ''),
  ref_id: Joi.string().uuid().allow(null, ''),
}).min(1)

