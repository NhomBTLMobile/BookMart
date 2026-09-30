import { Op } from 'sequelize'
import Orders from './orders.model.js'
import { sequelize } from '../../config/database.js'

export class OrdersRepository {
  async findAll({ limit, offset, sort, order, search }) {
    let whereClause = ''
    const replacements = {}

    if (search) {
      whereClause = 'WHERE o.order_code ILIKE :search OR u.full_name ILIKE :search OR u.phone ILIKE :search'
      replacements.search = `%${search}%`
    }

    const sortField = sort || 'o.created_at'
    const sortOrder = order || 'DESC'

    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
    `, { replacements })

    const total = parseInt(countResult[0].count, 10)

    const [rows] = await sequelize.query(`
      SELECT 
        o.*,
        u.full_name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT :limit OFFSET :offset
    `, { 
      replacements: { ...replacements, limit, offset } 
    })

    return { total, data: rows }
  }

  async findById(id) {
    const [orders] = await sequelize.query(`
      SELECT 
        o.*,
        u.full_name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = :id
    `, { replacements: { id } })
    
    if (!orders || orders.length === 0) return null
    const order = orders[0]

    const [items] = await sequelize.query(`
      SELECT id, item_name, unit_price, quantity, total_price, book_id
      FROM order_items
      WHERE order_id = :id
    `, { replacements: { id } })
    
    order.items = items || []
    return order
  }

  async create(data) {
    return Orders.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await Orders.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Orders.destroy({ where: { id } })
  }
}
