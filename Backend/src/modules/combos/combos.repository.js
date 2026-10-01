import { Op } from 'sequelize'
import Combos from './combos.model.js'
import ComboBooks from '../combo_books/combo_books.model.js'

export class CombosRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['name'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await Combos.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    const combo = await Combos.findByPk(id)
    if (!combo) return null;
    const books = await ComboBooks.findAll({ where: { combo_id: id } });
    return { ...combo.toJSON(), books: books.map(b => b.toJSON()) };
  }

  async create(data, options = {}) {
    return Combos.create(data, options)
  }

  async update(id, data, options = {}) {
    const [affectedRows] = await Combos.update(data, { where: { id }, ...options })
    if (affectedRows === 0 && !options.transaction) return null
    return this.findById(id)
  }

  async delete(id) {
    return Combos.destroy({ where: { id } })
  }

}
