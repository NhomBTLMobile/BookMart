import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Payments = sequelize.define(
  'payments',
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
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gateway_txn_id: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 100] },
    },
    gateway_ref: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 100] },
    },
    gateway_response: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'payments',
    timestamps: false,
    underscored: true,
  }
)

export default Payments
