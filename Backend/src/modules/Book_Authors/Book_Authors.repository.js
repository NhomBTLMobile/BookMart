import { Op } from 'sequelize'
import Book_Authors from './Book_Authors.model.js'

export class Book_AuthorsRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'book_id'
    const { count, rows } = await Book_Authors.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Book_Authors.findByPk(id)
  }

  async create(data) {
    return Book_Authors.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Book_Authors.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Book_Authors.destroy({ where: { id } })
  }

}
