import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const ComboBooks = sequelize.define(
  'combo_books',
  {
    combo_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    book_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    quantity: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
  },
  {
    tableName: 'combo_books',
    timestamps: false,
    underscored: true,
  }
)

export default ComboBooks
