import { Op } from 'sequelize'
import ComboBooks from './combo_books.model.js'

export class ComboBooksRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'combo_id'
    const { count, rows } = await ComboBooks.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return ComboBooks.findByPk(id)
  }

  async create(data) {
    return ComboBooks.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await ComboBooks.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return ComboBooks.destroy({ where: { id } })
  }

}
