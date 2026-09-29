import { Op } from 'sequelize'
import ShippingOrders from './shipping_orders.model.js'

export class ShippingOrdersRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['provider_order_id'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['tracking_code'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['shipping_status'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await ShippingOrders.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return ShippingOrders.findByPk(id)
  }

  async create(data) {
    return ShippingOrders.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await ShippingOrders.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return ShippingOrders.destroy({ where: { id } })
  }

}
