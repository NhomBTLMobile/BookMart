import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const User_Addresses = sequelize.define(
  'User_Addresses',
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
    receiver_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 100] },
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 20] },
    },
    address_detail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 255] },
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
    tableName: 'User_Addresses',
    timestamps: false,
    underscored: true,
  }
)

export default User_Addresses
