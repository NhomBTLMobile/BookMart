import { Op } from 'sequelize'
import Users from './Users.model.js'

export class UsersRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['email'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['password_hash'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['full_name'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['phone_number'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await Users.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Users.findByPk(id)
  }

  async create(data) {
    return Users.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Users.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Users.destroy({ where: { id } })
  }

  async findByEmail(email) {
    return Users.findOne({ where: { email } })
  }
}
