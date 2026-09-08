import { Op } from 'sequelize'
import User_Addresses from './User_Addresses.model.js'

export class User_AddressesRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['receiver_name'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['phone_number'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['address_detail'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await User_Addresses.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return User_Addresses.findByPk(id)
  }

  async create(data) {
    return User_Addresses.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await User_Addresses.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return User_Addresses.destroy({ where: { id } })
  }

}
