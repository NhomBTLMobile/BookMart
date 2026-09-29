import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Publishers = sequelize.define(
  'publishers',
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
  },
  {
    tableName: 'publishers',
    timestamps: false,
    underscored: true,
  }
)

export default Publishers
