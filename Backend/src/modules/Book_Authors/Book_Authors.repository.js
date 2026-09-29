import { Op } from 'sequelize'
import BookAuthors from './book_authors.model.js'

export class BookAuthorsRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'book_id'
    const { count, rows } = await BookAuthors.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return BookAuthors.findByPk(id)
  }

  async create(data) {
    return BookAuthors.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await BookAuthors.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return BookAuthors.destroy({ where: { id } })
  }

}
