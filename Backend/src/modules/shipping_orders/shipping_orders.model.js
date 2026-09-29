import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const ShippingOrders = sequelize.define(
  'shipping_orders',
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
    provider_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 100] },
    },
    tracking_code: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 100] },
    },
    shipping_status: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 50] },
    },
    fee: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    expected_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'shipping_orders',
    timestamps: false,
    underscored: true,
  }
)

export default ShippingOrders
