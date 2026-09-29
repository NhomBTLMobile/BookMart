import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const BookAuthors = sequelize.define(
  'book_authors',
  {
    book_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    author_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'book_authors',
    timestamps: false,
    underscored: true,
  }
)

export default BookAuthors
