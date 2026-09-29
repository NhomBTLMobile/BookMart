import { Op } from 'sequelize'
import UserAddresses from './user_addresses.model.js'

export class UserAddressesRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['label'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['recipient_name'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['phone'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['province_name'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['district_name'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['ward_code'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['ward_name'] = { [Op.iLike]: `%${search}%` }
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
    return UserAddresses.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await UserAddresses.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return UserAddresses.destroy({ where: { id } })
  }

}
