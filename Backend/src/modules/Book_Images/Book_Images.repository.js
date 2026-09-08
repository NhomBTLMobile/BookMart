import { Op } from 'sequelize'
import Book_Images from './Book_Images.model.js'

export class Book_ImagesRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'id'
    const { count, rows } = await Book_Images.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Book_Images.findByPk(id)
  }

  async create(data) {
    return Book_Images.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Book_Images.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Book_Images.destroy({ where: { id } })
  }

}
