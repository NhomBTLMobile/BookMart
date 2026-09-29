import { Op } from 'sequelize'
import BookCategories from './book_categories.model.js'

export class BookCategoriesRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'book_id'
    const { count, rows } = await BookCategories.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return BookCategories.findByPk(id)
  }

  async create(data) {
    return BookCategories.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await BookCategories.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return BookCategories.destroy({ where: { id } })
  }

}
