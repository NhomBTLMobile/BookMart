import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Authors = sequelize.define(
  'authors',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 255] },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 255] },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'authors',
    timestamps: false,
    underscored: true,
  }
)

export default Authors
