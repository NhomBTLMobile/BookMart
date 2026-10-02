import { Op } from 'sequelize'
import Categories from './categories.model.js'
import { sequelize } from '../../config/database.js'

export class CategoriesRepository {
  async findAll({ limit, offset, sort, order, search }) {
    let whereClause = ''
    const replacements = {}

    if (search) {
      whereClause = 'WHERE name ILIKE :search OR slug ILIKE :search'
      replacements.search = `%${search}%`
    }

    const sortField = sort || 'sort_order'
    const sortOrder = order || 'ASC'

    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count FROM categories ${whereClause}
    `, { replacements })
    
    const total = parseInt(countResult[0].count, 10)

    const [rows] = await sequelize.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM book_categories bc WHERE bc.category_id = c.id) as book_count
      FROM categories c
      ${whereClause}
      ORDER BY c.${sortField} ${sortOrder}
      LIMIT :limit OFFSET :offset
    `, { 
      replacements: { ...replacements, limit: limit || 100, offset: offset || 0 } 
    })

    return { total, data: rows }
  }

  async findById(id) {
    return Categories.findByPk(id)
  }

  async create(data) {
    return Categories.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Categories.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Categories.destroy({ where: { id } })
  }

}
