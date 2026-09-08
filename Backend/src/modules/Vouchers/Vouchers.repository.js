import { Op } from 'sequelize'
import Vouchers from './Vouchers.model.js'

export class VouchersRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['code'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await Vouchers.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Vouchers.findByPk(id)
  }

  async create(data) {
    return Vouchers.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Vouchers.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Vouchers.destroy({ where: { id } })
  }

}
