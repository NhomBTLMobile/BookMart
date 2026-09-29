import { Op } from 'sequelize'
import Publishers from './publishers.model.js'

export class PublishersRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['name'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await Publishers.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Publishers.findByPk(id)
  }

  async create(data) {
    return Publishers.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Publishers.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Publishers.destroy({ where: { id } })
  }

}
