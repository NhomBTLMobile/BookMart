import { Op } from 'sequelize'
import Orders from './orders.model.js'
import OrderItems from '../order_items/order_items.model.js'
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
      SELECT oi.id, oi.item_name, oi.unit_price, oi.quantity, oi.total_price, oi.book_id, oi.combo_id,
             COALESCE(bi.image_url, c.cover_image_url) as image_url,
             CASE WHEN oi.combo_id IS NOT NULL THEN true ELSE false END as "isCombo"
      FROM order_items oi
      LEFT JOIN book_images bi ON oi.book_id = bi.book_id AND bi.sort_order = 1
      LEFT JOIN combos c ON oi.combo_id = c.id
      WHERE oi.order_id = :id
    `, { replacements: { id } })
    
    order.items = items || []
    return order
  }

  async findByOrderCode(orderCode) {
    const [orders] = await sequelize.query(`
      SELECT 
        o.*,
        u.full_name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.order_code = :orderCode
    `, { replacements: { orderCode } })
    
    if (!orders || orders.length === 0) return null
    const order = orders[0]

    const [items] = await sequelize.query(`
      SELECT oi.id, oi.item_name, oi.unit_price, oi.quantity, oi.total_price, oi.book_id, oi.combo_id,
             COALESCE(bi.image_url, c.cover_image_url) as image_url,
             CASE WHEN oi.combo_id IS NOT NULL THEN true ELSE false END as "isCombo"
      FROM order_items oi
      LEFT JOIN book_images bi ON oi.book_id = bi.book_id AND bi.sort_order = 1
      LEFT JOIN combos c ON oi.combo_id = c.id
      WHERE oi.order_id = :id
    `, { replacements: { id: order.id } })
    
    order.items = items || []
    return order
  }

  async findByUserId(userId) {
    const [rows] = await sequelize.query(`
      SELECT o.*, u.full_name as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.user_id = :userId
      ORDER BY o.created_at DESC
    `, { replacements: { userId } })

    for (const order of rows) {
      const [items] = await sequelize.query(`
        SELECT oi.id, oi.item_name, oi.unit_price, oi.quantity, oi.total_price, oi.book_id, oi.combo_id, 
               COALESCE(bi.image_url, c.cover_image_url) as image_url,
               CASE WHEN oi.combo_id IS NOT NULL THEN true ELSE false END as "isCombo"
        FROM order_items oi
        LEFT JOIN book_images bi ON oi.book_id = bi.book_id AND bi.sort_order = 1
        LEFT JOIN combos c ON oi.combo_id = c.id
        WHERE oi.order_id = :orderId
      `, { replacements: { orderId: order.id } })
      order.items = items || []
    }
    return rows
  }

  async create(data) {
    const { items, ...orderData } = data;
    const transaction = await sequelize.transaction();
    try {
      const order = await Orders.create(orderData, { transaction });
      if (items && items.length > 0) {
        const orderItemsData = items.map(i => ({
          ...i,
          order_id: order.id
        }));
        await OrderItems.bulkCreate(orderItemsData, { transaction });
      }
      await transaction.commit();
      return this.findById(order.id);
    } catch (e) {
      await transaction.rollback();
      console.error('[OrdersRepository.create] Error details:', e.message, e.original?.message, e.original?.detail);
      throw e;
    }
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
