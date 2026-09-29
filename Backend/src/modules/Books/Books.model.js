import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const Books = sequelize.define(
  'books',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 500] },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 520] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    publisher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    format: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 20] },
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 50] },
    },
    warehouse_location: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 100] },
    },
    stock_qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    original_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    sale_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    sold_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight_grams: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    length_cm: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    width_cm: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height_cm: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    copyright_holder: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 255] },
    },
    license_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    avg_rating: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    review_count: {
      type: DataTypes.INTEGER,
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
  },
  {
    tableName: 'books',
    timestamps: false,
    underscored: true,
  }
)

export default Books
