import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const CartItems = sequelize.define(
  'cart_items',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    book_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    combo_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'cart_items',
    timestamps: false,
    underscored: true,
  }
)

export default CartItems
