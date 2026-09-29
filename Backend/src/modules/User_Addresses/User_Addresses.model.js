import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const UserAddresses = sequelize.define(
  'user_addresses',
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
    label: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 50] },
    },
    recipient_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 255] },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 20] },
    },
    province_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    province_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 100] },
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    district_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 100] },
    },
    ward_code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 20] },
    },
    ward_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 100] },
    },
    street_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: 'user_addresses',
    timestamps: false,
    underscored: true,
  }
)

export default UserAddresses
