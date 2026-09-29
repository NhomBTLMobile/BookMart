import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Categories = sequelize.define(
  'categories',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 100] },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 120] },
    },
    icon_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: 'categories',
    timestamps: false,
    underscored: true,
  }
)

export default Categories
