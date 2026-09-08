import { Op } from 'sequelize'
import Wishlists from './Wishlists.model.js'

export class WishlistsRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'user_id'
    const { count, rows } = await Wishlists.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Wishlists.findByPk(id)
  }

  async create(data) {
    return Wishlists.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Wishlists.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Wishlists.destroy({ where: { id } })
  }

}
