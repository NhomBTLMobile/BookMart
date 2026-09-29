import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const LoyaltyPointsLedger = sequelize.define(
  'loyalty_points_ledger',
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
    delta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    balance_after: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ref_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'loyalty_points_ledger',
    timestamps: false,
    underscored: true,
  }
)

export default LoyaltyPointsLedger
