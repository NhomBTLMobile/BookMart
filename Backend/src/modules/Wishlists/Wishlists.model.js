import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Wishlists = sequelize.define(
  'Wishlists',
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    book_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'Wishlists',
    timestamps: false,
    underscored: true,
  }
)

export default Wishlists
