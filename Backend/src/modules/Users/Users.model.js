import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Users = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 255] },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 20] },
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 255] },
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_vector: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    is_active: {
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
    tableName: 'users',
    timestamps: false,
    underscored: true,
  }
)

export default Users
