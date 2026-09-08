import { Op } from 'sequelize'
import Book_Categories from './Book_Categories.model.js'

export class Book_CategoriesRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'book_id'
    const { count, rows } = await Book_Categories.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Book_Categories.findByPk(id)
  }

  async create(data) {
    return Book_Categories.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Book_Categories.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Book_Categories.destroy({ where: { id } })
  }

}
