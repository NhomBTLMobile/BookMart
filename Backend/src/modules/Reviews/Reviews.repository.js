import { Op } from 'sequelize'
import Reviews from './reviews.model.js'
import { sequelize } from '../../config/database.js'
import Users from '../users/users.model.js'
import LoyaltyPointsLedger from '../loyalty_points_ledger/loyalty_points_ledger.model.js'
import OrderItems from '../order_items/order_items.model.js'

export class ReviewsRepository {
  async findAll({ limit, offset, sort, order, search, book_id, user_id }) {
    let whereClause = ''
    const replacements = {}
    let conditions = []

    if (search) {
      conditions.push('(r.body ILIKE :search OR u.full_name ILIKE :search OR b.title ILIKE :search)')
      replacements.search = `%${search}%`
    }

    if (book_id) {
      conditions.push('r.book_id = :book_id')
      replacements.book_id = book_id
    }

    if (user_id) {
      conditions.push('r.user_id = :user_id')
      replacements.user_id = user_id
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ')
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
    const transaction = await sequelize.transaction();
    try {
      if (data.order_item_id) {
        const existingReview = await Reviews.findOne({ where: { order_item_id: data.order_item_id }, transaction });
        if (existingReview) {
           const err = new Error('Sản phẩm này đã được đánh giá');
           err.status = 400;
           throw err;
        }
      }

      const review = await Reviews.create(data, { transaction });
      let pointsAwarded = false;
      
      // Tặng 500 điểm khi đánh giá sản phẩm thành công (1 lần duy nhất trên 1 đơn hàng)
      if (data.user_id && data.order_item_id) {
        const orderItem = await OrderItems.findByPk(data.order_item_id, { transaction });
        
        if (orderItem && orderItem.order_id) {
          // Kiểm tra xem đã tặng điểm cho ĐƠN HÀNG này chưa
          const existingEarn = await LoyaltyPointsLedger.findOne({
            where: { user_id: data.user_id, ref_id: orderItem.order_id, type: 'earn_review' },
            transaction
          });
          
          if (!existingEarn) {
            const user = await Users.findByPk(data.user_id, { transaction });
            if (user) {
              const earnedPoints = 500;
              const newBalance = (user.loyalty_points || 0) + earnedPoints;
              await user.update({ loyalty_points: newBalance }, { transaction });
              await LoyaltyPointsLedger.create({
                user_id: data.user_id,
                delta: earnedPoints,
                balance_after: newBalance,
                type: 'earn_review',
                ref_id: orderItem.order_id, // Lưu ref_id là order_id để kiểm soát
                created_at: new Date()
              }, { transaction });
              pointsAwarded = true;
            }
          }
        }
      }
      
      await transaction.commit();
      review.dataValues.pointsAwarded = pointsAwarded;
      return review;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  async update(id, data) {
    const [affectedRows] = await Reviews.update(data, { 
      where: { id },
      individualHooks: true 
    })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return Reviews.destroy({ 
      where: { id },
      individualHooks: true 
    })
  }
}
