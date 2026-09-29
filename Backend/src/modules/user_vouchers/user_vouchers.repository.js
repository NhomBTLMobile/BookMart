import { Op } from 'sequelize'
import UserVouchers from './user_vouchers.model.js'

export class UserVouchersRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'id'
    const { count, rows } = await UserVouchers.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return UserVouchers.findByPk(id)
  }

  async create(data) {
    return UserVouchers.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await UserVouchers.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return UserVouchers.destroy({ where: { id } })
  }

}
