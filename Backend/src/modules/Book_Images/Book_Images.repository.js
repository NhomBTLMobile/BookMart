import { Op } from 'sequelize'
import BookImages from './book_images.model.js'

export class BookImagesRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}

    const sortField = sort || 'id'
    const { count, rows } = await BookImages.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return BookImages.findByPk(id)
  }

  async create(data) {
    return BookImages.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await BookImages.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return BookImages.destroy({ where: { id } })
  }

}
