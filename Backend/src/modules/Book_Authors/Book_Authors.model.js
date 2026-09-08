import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Book_Authors = sequelize.define(
  'Book_Authors',
  {
    book_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    author_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
  },
  {
    tableName: 'Book_Authors',
    timestamps: false,
    underscored: true,
  }
)

export default Book_Authors
