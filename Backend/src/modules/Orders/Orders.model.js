import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Orders = sequelize.define(
  'Orders',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    voucher_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount_price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    final_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    vnpay_tran_no: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 255] },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'Orders',
    timestamps: false,
    underscored: true,
  }
)

export default Orders
