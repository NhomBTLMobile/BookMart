import { Op } from 'sequelize'
import Combos from './combos.model.js'

export class CombosRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['name'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await Combos.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Combos.findByPk(id)
  }

  async create(data) {
    return Combos.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Combos.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Combos.destroy({ where: { id } })
  }

}
