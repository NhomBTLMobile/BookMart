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
  }
)

export default Reviews
