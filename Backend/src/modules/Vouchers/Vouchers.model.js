import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Vouchers = sequelize.define(
  'vouchers',
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    max_discount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    min_order_value: {
      type: DataTypes.DECIMAL,
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
    ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: 'vouchers',
    timestamps: false,
    underscored: true,
  }
)

export default Vouchers
