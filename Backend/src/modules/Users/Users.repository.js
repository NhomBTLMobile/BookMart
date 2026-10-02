import { Op } from 'sequelize'
import Users from './users.model.js'
import { sequelize } from '../../config/database.js'

export class UsersRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { full_name: { [Op.iLike]: `%${search}%` } }
      ]
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
    const [rows] = await sequelize.query(`
      SELECT u.*, 
             (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as order_count,
             (SELECT COUNT(*) FROM wishlists w WHERE w.user_id = u.id) as wishlist_count
      FROM users u
      WHERE u.id = :id
    `, { 
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    })
    return rows || null
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
