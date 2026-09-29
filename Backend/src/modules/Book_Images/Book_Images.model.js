import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const BookImages = sequelize.define(
  'book_images',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    book_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'book_images',
    timestamps: false,
    underscored: true,
  }
)

export default BookImages
