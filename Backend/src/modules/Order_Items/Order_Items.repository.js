import { Op } from 'sequelize'
import Order_Items from './Order_Items.model.js'

export class Order_ItemsRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'id'
    const { count, rows } = await Order_Items.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Order_Items.findByPk(id)
  }

  async create(data) {
    return Order_Items.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Order_Items.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Order_Items.destroy({ where: { id } })
  }

}
