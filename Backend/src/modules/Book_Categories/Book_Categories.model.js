import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const BookCategories = sequelize.define(
  'book_categories',
  {
    book_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: 'book_categories',
    timestamps: false,
    underscored: true,
  }
)

export default BookCategories
