import { Op } from 'sequelize'
import Books from './books.model.js'

export class BooksRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where['title'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['slug'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['isbn'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['barcode'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['warehouse_location'] = { [Op.iLike]: `%${search}%` }
    }
    if (search) {
      where['copyright_holder'] = { [Op.iLike]: `%${search}%` }
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

  // Common include array for book summaries
  getSummaryIncludes() {
    return [
      'images', // Assuming alias is 'images'
      { association: 'authors', attributes: ['id', 'name'] },
      { association: 'categories', attributes: ['id', 'name'] }
    ]
  }

  async findFeatured({ limit = 10 }) {
    return Books.findAll({
      where: { is_active: true },
      order: [['avg_rating', 'DESC NULLS LAST']],
      limit,
      include: this.getSummaryIncludes()
    })
  }

  async findNew({ limit = 10 }) {
    return Books.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']],
      limit,
      include: this.getSummaryIncludes()
    })
  }

  async findBestsellers({ limit = 10 }) {
    return Books.findAll({
      where: { is_active: true },
      order: [['sold_count', 'DESC']],
      limit,
      include: this.getSummaryIncludes()
    })
  }

  async findDetails(id) {
    return Books.findOne({
      where: { id, is_active: true },
      include: [
        'images',
        { association: 'authors' },
        { association: 'categories' },
        { association: 'publisher' }
      ]
    })
  }

  async searchAdvanced({ query, category_id, publisher_id, min_price, max_price, sort, order, limit, offset }) {
    const where = { is_active: true }
    if (query) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { '$authors.name$': { [Op.iLike]: `%${query}%` } }
      ]
    }
    if (category_id) where['$categories.id$'] = category_id
    if (publisher_id) where.publisher_id = publisher_id
    if (min_price || max_price) {
      where.sale_price = {}
      if (min_price) where.sale_price[Op.gte] = min_price
      if (max_price) where.sale_price[Op.lte] = max_price
    }

    const sortField = sort || 'created_at'
    const sortOrder = order || 'DESC'

    const { count, rows } = await Books.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, sortOrder]],
      include: this.getSummaryIncludes(),
      distinct: true // important when using include with belongsToMany
    })

    return { total: count, data: rows }
  }

}
