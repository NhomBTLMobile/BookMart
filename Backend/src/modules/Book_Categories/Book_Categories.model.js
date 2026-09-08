import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Book_Categories = sequelize.define(
  'Book_Categories',
  {
    book_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    category_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
  },
  {
    tableName: 'Book_Categories',
    timestamps: false,
    underscored: true,
  }
)

export default Book_Categories
