import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const UserVouchers = sequelize.define(
  'user_vouchers',
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
    voucher_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: 'user_vouchers',
    timestamps: false,
    underscored: true,
  }
)

export default UserVouchers
