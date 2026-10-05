import { Op } from 'sequelize'
import UserAddresses from './user_addresses.model.js'

export class UserAddressesRepository {
  async findAll({ limit, offset, sort, order, search, user_id }) {
    const where = {}
    if (search) {
      where[Op.or] = [
        { label: { [Op.iLike]: `%${search}%` } },
        { recipient_name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { province_name: { [Op.iLike]: `%${search}%` } },
        { district_name: { [Op.iLike]: `%${search}%` } },
        { ward_name: { [Op.iLike]: `%${search}%` } },
      ]
    }
    
    if (user_id) {
      where.user_id = user_id
    }

    const sortField = sort || 'id'
    const { count, rows } = await UserAddresses.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return UserAddresses.findByPk(id)
  }

  async create(data) {
    if (data.is_default && data.user_id) {
      await UserAddresses.update({ is_default: false }, { where: { user_id: data.user_id } })
    }
    return UserAddresses.create(data)
  }

  async update(id, data) {
    if (data.is_default) {
      const addr = await this.findById(id)
      if (addr && addr.user_id) {
        await UserAddresses.update({ is_default: false }, { where: { user_id: addr.user_id } })
      }
    }
    const [affectedRows] = await UserAddresses.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return UserAddresses.destroy({ where: { id } })
  }

}
