import { Op } from 'sequelize'
import BookFeatureVectors from './book_feature_vectors.model.js'

export class BookFeatureVectorsRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'book_id'
    const { count, rows } = await BookFeatureVectors.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return BookFeatureVectors.findByPk(id)
  }

  async create(data) {
    return BookFeatureVectors.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await BookFeatureVectors.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return BookFeatureVectors.destroy({ where: { id } })
  }

}
