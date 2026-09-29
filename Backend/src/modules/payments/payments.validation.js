import Joi from 'joi'

export const createPaymentsSchema = Joi.object({
  order_id: Joi.string().uuid().allow(null, ''),
  method: Joi.string().required(),
  amount: Joi.number().required(),
  status: Joi.string().allow(null, ''),
  gateway_txn_id: Joi.string().allow(null, ''),
  gateway_ref: Joi.string().allow(null, ''),
  gateway_response: Joi.object().allow(null, ''),
  paid_at: Joi.date().allow(null, ''),
})

export const updatePaymentsSchema = Joi.object({
  order_id: Joi.string().uuid().allow(null, ''),
  method: Joi.string().allow(null, ''),
  amount: Joi.number().allow(null, ''),
  status: Joi.string().allow(null, ''),
  gateway_txn_id: Joi.string().allow(null, ''),
  gateway_ref: Joi.string().allow(null, ''),
  gateway_response: Joi.object().allow(null, ''),
  paid_at: Joi.date().allow(null, ''),
}).min(1)

