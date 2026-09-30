import { Op } from 'sequelize'
import Reviews from './reviews.model.js'
import { sequelize } from '../../config/database.js'

export class ReviewsRepository {
  async findAll({ limit, offset, sort, order, search }) {
    let whereClause = ''
    const replacements = {}

    if (search) {
      whereClause = 'WHERE r.body ILIKE :search OR u.full_name ILIKE :search OR b.title ILIKE :search'
      replacements.search = `%${search}%`
    }

    const sortField = sort ? `r.${sort}` : 'r.created_at'
    const sortOrder = order || 'DESC'

    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN books b ON r.book_id = b.id
      ${whereClause}
    `, { replacements })

    const total = parseInt(countResult[0].count, 10)

    const [rows] = await sequelize.query(`
      SELECT 
        r.*,
        u.full_name as user_name,
        u.email as user_email,
        u.avatar_url as user_avatar_url,
        b.title as book_title,
        (SELECT image_url FROM book_images bi WHERE bi.book_id = b.id LIMIT 1) as book_image_url
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN books b ON r.book_id = b.id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT :limit OFFSET :offset
    `, { 
      replacements: { ...replacements, limit, offset } 
    })

    return { total, data: rows }
  }

  async findById(id) {
    const [rows] = await sequelize.query(`
      SELECT 
        r.*,
        u.full_name as user_name,
        u.email as user_email,
        u.avatar_url as user_avatar_url,
        b.title as book_title,
        (SELECT image_url FROM book_images bi WHERE bi.book_id = b.id LIMIT 1) as book_image_url
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN books b ON r.book_id = b.id
      WHERE r.id = :id
    `, { replacements: { id } })
    
    if (!rows || rows.length === 0) return null
    return rows[0]
  }

  async create(data) {
    return Reviews.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Reviews.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Reviews.destroy({ where: { id } })
  }
}
