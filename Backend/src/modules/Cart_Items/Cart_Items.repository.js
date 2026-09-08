import { Op } from 'sequelize'
import Cart_Items from './Cart_Items.model.js'

export class Cart_ItemsRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'id'
    const { count, rows } = await Cart_Items.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Cart_Items.findByPk(id)
  }

  async create(data) {
    return Cart_Items.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Cart_Items.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Cart_Items.destroy({ where: { id } })
  }

}
