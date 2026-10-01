import { CombosRepository } from './combos.repository.js'
import ComboBooks from '../combo_books/combo_books.model.js'
import { sequelize } from '../../config/database.js'

const repo = new CombosRepository()

export class CombosService {
  async getAll(query) {
    return repo.findAll(query)
  }

  async getById(id) {
    const item = await repo.findById(id)
    if (!item) {
      const err = new Error('Không tìm thấy combos')
      err.status = 404
      throw err
    }
    return item
  }

  async create(data) {
    const t = await sequelize.transaction();
    try {
      const { books, ...comboData } = data;
      const combo = await repo.create(comboData, { transaction: t });
      
      if (books && books.length > 0) {
        const comboBooksData = books.map(b => ({
          combo_id: combo.id,
          book_id: b.book_id,
          quantity: b.quantity || 1
        }));
        await ComboBooks.bulkCreate(comboBooksData, { transaction: t });
      }
      
      await t.commit();
      return this.getById(combo.id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async update(id, data) {
    await this.getById(id) // throws 404 if not found
    
    const t = await sequelize.transaction();
    try {
      const { books, ...comboData } = data;
      await repo.update(id, comboData, { transaction: t });
      
      if (books !== undefined) {
        // Delete old combo_books
        await ComboBooks.destroy({ where: { combo_id: id }, transaction: t });
        
        // Insert new combo_books
        if (books.length > 0) {
          const comboBooksData = books.map(b => ({
            combo_id: id,
            book_id: b.book_id,
            quantity: b.quantity || 1
          }));
          await ComboBooks.bulkCreate(comboBooksData, { transaction: t });
        }
      }
      
      await t.commit();
      return this.getById(id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async delete(id) {
    await this.getById(id)
    return repo.delete(id)
  }

}
