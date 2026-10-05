import { Op } from 'sequelize'
import LoyaltyPointsLedger from './loyalty_points_ledger.model.js'

export class LoyaltyPointsLedgerRepository {
  async findAll({ limit, offset, sort, order, search, user_id }) {
    const where = {}
    if (user_id) where.user_id = user_id;

    const sortField = sort || 'created_at'
    const { count, rows } = await LoyaltyPointsLedger.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return LoyaltyPointsLedger.findByPk(id)
  }

  async create(data) {
    return LoyaltyPointsLedger.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await LoyaltyPointsLedger.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return LoyaltyPointsLedger.destroy({ where: { id } })
  }

}
