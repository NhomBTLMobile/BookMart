import Joi from 'joi'

export const createBookFeatureVectorsSchema = Joi.object({
  category_vector: Joi.object().required(),
  author_vector: Joi.object().required(),
  format_vector: Joi.object().required(),
  combined_vector: Joi.object().allow(null, ''),
})

export const updateBookFeatureVectorsSchema = Joi.object({
  category_vector: Joi.object().allow(null, ''),
  author_vector: Joi.object().allow(null, ''),
  format_vector: Joi.object().allow(null, ''),
  combined_vector: Joi.object().allow(null, ''),
}).min(1)

