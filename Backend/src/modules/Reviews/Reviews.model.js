import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Reviews = sequelize.define(
  'reviews',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    book_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    order_item_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    combo_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'reviews',
    timestamps: false,
    underscored: true,
    hooks: {
      afterSave: async (review, options) => {
        if (review.book_id) await updateBookRating(review.book_id)
        if (review.combo_id) await updateComboRating(review.combo_id)
      },
      afterUpdate: async (review, options) => {
        if (review.book_id) await updateBookRating(review.book_id)
        if (review.combo_id) await updateComboRating(review.combo_id)
      },
      afterDestroy: async (review, options) => {
        if (review.book_id) await updateBookRating(review.book_id)
        if (review.combo_id) await updateComboRating(review.combo_id)
      }
    }
  }
)

async function updateBookRating(bookId) {
  const query = `
    UPDATE books
    SET 
      avg_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE book_id = :bookId), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE book_id = :bookId)
    WHERE id = :bookId;
  `
  try {
    await sequelize.query(query, { replacements: { bookId } })
  } catch (err) {
    console.error('Lỗi khi cập nhật rating cho sách:', err)
  }
}

async function updateComboRating(comboId) {
  const query = `
    UPDATE combos
    SET 
      avg_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE combo_id = :comboId), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE combo_id = :comboId)
    WHERE id = :comboId;
  `
  try {
    await sequelize.query(query, { replacements: { comboId } })
  } catch (err) {
    console.error('Lỗi khi cập nhật rating cho combo:', err)
  }
}

export default Reviews
