import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Orders = sequelize.define(
  'orders',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    order_code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 50] },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    shipping_snapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    shipping_fee: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    points_discount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    voucher_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    points_used: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    order_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'orders',
    timestamps: false,
    underscored: true,
  }
)

export default Orders
