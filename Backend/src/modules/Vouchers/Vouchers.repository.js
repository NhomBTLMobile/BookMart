import { Op } from 'sequelize'
import Vouchers from './vouchers.model.js'
import { sequelize } from '../../config/database.js'

export class VouchersRepository {
  async findAll({ limit, offset, sort, order, search, user_id }) {
    const where = {}
    if (search) {
      where['code'] = { [Op.iLike]: `%${search}%` }
    }
    
    where.is_active = true;

    // Filter out used vouchers for this user
    if (user_id) {
      where.id = {
        [Op.notIn]: sequelize.literal(`(SELECT voucher_id FROM user_vouchers WHERE user_id = '${user_id}' AND is_used = true)`)
      }
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
