import { Op } from 'sequelize'
import Authors from './Authors.model.js'

export class AuthorsRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['name'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await Authors.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Authors.findByPk(id)
  }

  async create(data) {
    return Authors.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Authors.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Authors.destroy({ where: { id } })
  }

}
