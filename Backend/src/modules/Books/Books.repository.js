import { Op } from 'sequelize'
import Books from './Books.model.js'

export class BooksRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['title'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['publisher'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await Books.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Books.findByPk(id)
  }

  async create(data) {
    return Books.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Books.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Books.destroy({ where: { id } })
  }

}
