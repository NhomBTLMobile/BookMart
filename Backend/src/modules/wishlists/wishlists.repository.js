import { sequelize } from '../../config/database.js'

export class WishlistsRepository {
  async findByUserId(userId) {
    const [rows] = await sequelize.query(`
      SELECT 
        b.id, b.title, b.original_price, b.sale_price, b.avg_rating,
        (SELECT bi.image_url FROM book_images bi WHERE bi.book_id = b.id ORDER BY bi.sort_order ASC LIMIT 1) as image_url,
        (SELECT json_agg(json_build_object('name', a.name)) FROM book_authors ba JOIN authors a ON ba.author_id = a.id WHERE ba.book_id = b.id) as authors
      FROM wishlists w
      JOIN books b ON w.book_id = b.id
      WHERE w.user_id = :userId
      ORDER BY w.created_at DESC
    `, { 
      replacements: { userId }
    })
    
    // Parse authors logic to match BookCard expectation
    return rows.map(r => {
      // Postgres json_agg might return array of objects directly
      const authorList = typeof r.authors === 'string' ? JSON.parse(r.authors || '[]') : (r.authors || []);
      return {
        ...r,
        authors: authorList
      }
    })
  }

  async checkExists(userId, bookId) {
    const [rows] = await sequelize.query(`
      SELECT 1 FROM wishlists WHERE user_id = :userId AND book_id = :bookId
    `, { replacements: { userId, bookId } })
    return rows.length > 0
  }

  async add(userId, bookId) {
    await sequelize.query(`
      INSERT INTO wishlists (user_id, book_id) VALUES (:userId, :bookId) ON CONFLICT DO NOTHING
    `, { replacements: { userId, bookId } })
  }

  async remove(userId, bookId) {
    await sequelize.query(`
      DELETE FROM wishlists WHERE user_id = :userId AND book_id = :bookId
    `, { replacements: { userId, bookId } })
  }
}
