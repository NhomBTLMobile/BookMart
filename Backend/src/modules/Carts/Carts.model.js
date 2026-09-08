import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Carts = sequelize.define(
  'Carts',
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
    tableName: 'Carts',
    timestamps: false,
    underscored: true,
  }
)

export default Carts
