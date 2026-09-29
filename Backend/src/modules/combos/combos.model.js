import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Combos = sequelize.define(
  'combos',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 255] },
    },
    cover_image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    original_total: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    combo_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    stock_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'combos',
    timestamps: false,
    underscored: true,
  }
)

export default Combos
