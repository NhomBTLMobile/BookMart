import { Op } from 'sequelize'
import UserOauthProviders from './user_oauth_providers.model.js'

export class UserOauthProvidersRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['provider_uid'] = { [Op.iLike]: `%${search}%` }
    }

    const sortField = sort || 'id'
    const { count, rows } = await UserOauthProviders.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return UserOauthProviders.findByPk(id)
  }

  async create(data) {
    return UserOauthProviders.create(data)
  }

  async update(id, data) {
    const [affectedRows] = await UserOauthProviders.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id) {
    return UserOauthProviders.destroy({ where: { id } })
  }

  async findByProvider(provider, provider_uid) {
    return UserOauthProviders.findOne({ where: { provider, provider_uid } })
  }

}
