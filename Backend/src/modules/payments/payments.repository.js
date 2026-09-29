import { Op } from 'sequelize'
import Payments from './payments.model.js'

export class PaymentsRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['gateway_txn_id'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['gateway_ref'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await Payments.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Payments.findByPk(id)
  }

  async create(data) {
    return Payments.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Payments.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Payments.destroy({ where: { id } })
  }

}
