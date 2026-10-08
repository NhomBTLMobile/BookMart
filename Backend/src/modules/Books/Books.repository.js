import { Op } from 'sequelize'
import { sequelize } from '../../config/database.js'
import Books from './books.model.js'

export class BooksRepository {
  async findAll({ limit, offset, sort, order, search }) {
    const where = {}
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { slug: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } },
        { warehouse_location: { [Op.iLike]: `%${search}%` } },
        { copyright_holder: { [Op.iLike]: `%${search}%` } }
      ]
    }

    const sortField = sort || 'id'
    const { count, rows } = await Books.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, order || 'DESC']],
      include: this.getSummaryIncludes(),
      distinct: true
    })

    return { total: count, data: rows }
  }

  async findById(id) {
    return Books.findByPk(id)
  }

  async create(data) {
    const { author_ids, category_ids, image_url, ...bookData } = data
    const book = await Books.create(bookData)
    
    if (author_ids && author_ids.length > 0) {
      for (const authorId of author_ids) {
        await sequelize.query('INSERT INTO book_authors (book_id, author_id) VALUES (:bookId, :authorId)', {
          replacements: { bookId: book.id, authorId: authorId }
        })
      }
    }
    
    if (category_ids && category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await sequelize.query('INSERT INTO book_categories (book_id, category_id) VALUES (:bookId, :categoryId)', {
          replacements: { bookId: book.id, categoryId: categoryId }
        })
      }
    }
    
    if (image_url) {
      await sequelize.query('INSERT INTO book_images (book_id, image_url, sort_order) VALUES (:bookId, :url, 1)', {
        replacements: { bookId: book.id, url: image_url }
      })
    }
    
    return book
  }

  async update(id, data) {
    const { author_ids, category_ids, image_url, ...bookData } = data
    const [affectedRows] = await Books.update(bookData, { where: { id } })
    
    if (author_ids) {
      await sequelize.query('DELETE FROM book_authors WHERE book_id = :id', { replacements: { id } })
      for (const authorId of author_ids) {
        await sequelize.query('INSERT INTO book_authors (book_id, author_id) VALUES (:id, :authorId)', {
          replacements: { id, authorId }
        })
      }
    }
    
    if (category_ids) {
      await sequelize.query('DELETE FROM book_categories WHERE book_id = :id', { replacements: { id } })
      for (const categoryId of category_ids) {
        await sequelize.query('INSERT INTO book_categories (book_id, category_id) VALUES (:id, :categoryId)', {
          replacements: { id, categoryId }
        })
      }
    }
    
    if (image_url !== undefined) {
      await sequelize.query('DELETE FROM book_images WHERE book_id = :id', { replacements: { id } })
      if (image_url) {
        await sequelize.query('INSERT INTO book_images (book_id, image_url, sort_order) VALUES (:id, :url, 1)', {
          replacements: { id, url: image_url }
        })
      }
    }
    
    if (affectedRows === 0 && !author_ids && !category_ids && image_url === undefined) return null
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
    if (publisher_id) where.publisher_id = publisher_id
    if (min_price || max_price) {
      where.sale_price = {}
      if (min_price) where.sale_price[Op.gte] = min_price
      if (max_price) where.sale_price[Op.lte] = max_price
    }

    const sortField = sort || 'created_at'
    const sortOrder = order || 'DESC'

    const includes = this.getSummaryIncludes()
    if (category_id) {
      const categoryInclude = includes.find(inc => inc.association === 'categories')
      if (categoryInclude) {
        categoryInclude.where = { id: category_id }
      }
    }

    const { count, rows } = await Books.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, sortOrder]],
      include: includes,
      distinct: true // important when using include with belongsToMany
    })

    return { total: count, data: rows }
  }

}
