import { Op } from 'sequelize'
import Orders from './orders.model.js'
import OrderItems from '../order_items/order_items.model.js'
import { sequelize } from '../../config/database.js'
import Users from '../users/users.model.js'
import LoyaltyPointsLedger from '../loyalty_points_ledger/loyalty_points_ledger.model.js'
import UserVouchers from '../user_vouchers/user_vouchers.model.js'

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
             CASE WHEN oi.combo_id IS NOT NULL THEN true ELSE false END as "isCombo",
             (SELECT COUNT(*) FROM reviews r WHERE r.order_item_id = oi.id) > 0 as "isReviewed"
      FROM order_items oi
      LEFT JOIN book_images bi ON oi.book_id = bi.book_id AND bi.sort_order = 1
      LEFT JOIN combos c ON oi.combo_id = c.id
      WHERE oi.order_id = :id
    `, { replacements: { id } })
    
    order.items = items || []
    
    const [pointsResult] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM loyalty_points_ledger 
      WHERE type = 'earn_review' AND ref_id = :id
    `, { replacements: { id } })
    order.hasEarnedReviewPoints = parseInt(pointsResult[0].count, 10) > 0;

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
             CASE WHEN oi.combo_id IS NOT NULL THEN true ELSE false END as "isCombo",
             (SELECT COUNT(*) FROM reviews r WHERE r.order_item_id = oi.id) > 0 as "isReviewed"
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
               CASE WHEN oi.combo_id IS NOT NULL THEN true ELSE false END as "isCombo",
               (SELECT COUNT(*) FROM reviews r WHERE r.order_item_id = oi.id) > 0 as "isReviewed"
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

      // Trừ điểm thưởng nếu có
      if (orderData.points_used && orderData.points_used > 0 && orderData.user_id) {
        const user = await Users.findByPk(orderData.user_id, { transaction });
        if (user && user.loyalty_points >= orderData.points_used) {
          const newBalance = user.loyalty_points - orderData.points_used;
          await user.update({ loyalty_points: newBalance }, { transaction });
          
          await LoyaltyPointsLedger.create({
            user_id: orderData.user_id,
            delta: -orderData.points_used,
            balance_after: newBalance,
            type: 'redeem_order',
            ref_id: order.id,
            created_at: new Date()
          }, { transaction });
        } else {
          throw new Error('Không đủ điểm thưởng để thanh toán');
        }
      }

      // Đánh dấu voucher đã sử dụng nếu có
      if (orderData.voucher_id && orderData.user_id) {
        await UserVouchers.update(
          { is_used: true },
          { where: { user_id: orderData.user_id, voucher_id: orderData.voucher_id }, transaction }
        );
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
    const transaction = await sequelize.transaction();
    try {
      const oldOrder = await Orders.findByPk(id, { transaction });
      const [affectedRows] = await Orders.update(data, { where: { id }, transaction });
      
      // Nếu đơn hàng bị hủy, hoàn lại điểm và voucher
      if (data.order_status === 'cancelled' && oldOrder.order_status !== 'cancelled') {
        if (oldOrder.points_used && oldOrder.points_used > 0 && oldOrder.user_id) {
          const user = await Users.findByPk(oldOrder.user_id, { transaction });
          if (user) {
            const newBalance = (user.loyalty_points || 0) + oldOrder.points_used;
            await user.update({ loyalty_points: newBalance }, { transaction });
            await LoyaltyPointsLedger.create({
              user_id: oldOrder.user_id,
              delta: oldOrder.points_used,
              balance_after: newBalance,
              type: 'refund_order',
              ref_id: oldOrder.id,
              created_at: new Date()
            }, { transaction });
          }
        }
        if (oldOrder.voucher_id && oldOrder.user_id) {
          await UserVouchers.update(
            { is_used: false },
            { where: { user_id: oldOrder.user_id, voucher_id: oldOrder.voucher_id }, transaction }
          );
        }
      }

      // Nếu đơn hàng chuyển sang trạng thái đã giao hàng (delivered)
      if (data.order_status === 'delivered' && oldOrder.order_status !== 'delivered' && oldOrder.user_id) {
        // Kiểm tra xem đã cộng điểm cho đơn này chưa
        const existingEarn = await LoyaltyPointsLedger.findOne({
          where: { user_id: oldOrder.user_id, ref_id: oldOrder.id, type: 'earn_order' },
          transaction
        });
        
        if (!existingEarn) {
          const earnedPoints = Math.floor(oldOrder.total_amount / 100);
          if (earnedPoints > 0) {
            const user = await Users.findByPk(oldOrder.user_id, { transaction });
            if (user) {
              const newBalance = (user.loyalty_points || 0) + earnedPoints;
              await user.update({ loyalty_points: newBalance }, { transaction });
              await LoyaltyPointsLedger.create({
                user_id: oldOrder.user_id,
                delta: earnedPoints,
                balance_after: newBalance,
                type: 'earn_order',
                ref_id: oldOrder.id,
                created_at: new Date()
              }, { transaction });
            }
          }
        }
      }

      await transaction.commit();
      if (affectedRows === 0) return null;
      return this.findById(id);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  async delete(id) {
    const transaction = await sequelize.transaction();
    try {
      const order = await Orders.findByPk(id, { transaction });
      if (!order) {
        await transaction.rollback();
        return;
      }
      
      // Hoàn lại điểm và voucher trước khi xóa
      if (order.points_used && order.points_used > 0 && order.user_id) {
        const user = await Users.findByPk(order.user_id, { transaction });
        if (user) {
          const newBalance = (user.loyalty_points || 0) + order.points_used;
          await user.update({ loyalty_points: newBalance }, { transaction });
          await LoyaltyPointsLedger.create({
            user_id: order.user_id,
            delta: order.points_used,
            balance_after: newBalance,
            type: 'refund_order',
            ref_id: order.id,
            created_at: new Date()
          }, { transaction });
        }
      }
      if (order.voucher_id && order.user_id) {
        await UserVouchers.update(
          { is_used: false },
          { where: { user_id: order.user_id, voucher_id: order.voucher_id }, transaction }
        );
      }

      await OrderItems.destroy({ where: { order_id: id }, transaction });
      await Orders.destroy({ where: { id }, transaction });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
}
