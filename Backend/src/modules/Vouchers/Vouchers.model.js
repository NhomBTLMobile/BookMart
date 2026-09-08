import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Vouchers = sequelize.define(
  'Vouchers',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 50] },
    },
    discount_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    min_order_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    max_discount_amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    used_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: 'Vouchers',
    timestamps: false,
    underscored: true,
  }
)

export default Vouchers
