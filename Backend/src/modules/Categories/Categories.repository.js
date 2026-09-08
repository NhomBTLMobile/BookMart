import { Op } from 'sequelize'
import Categories from './Categories.model.js'

export class CategoriesRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['name'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await Categories.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Categories.findByPk(id)
  }

  async create(data) {
    return Categories.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Categories.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Categories.destroy({ where: { id } })
  }

}
