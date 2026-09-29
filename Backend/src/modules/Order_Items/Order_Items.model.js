import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const OrderItems = sequelize.define(
  'order_items',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    order_id: {
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
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 500] },
    },
    unit_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    tableName: 'order_items',
    timestamps: false,
    underscored: true,
  }
)

export default OrderItems
