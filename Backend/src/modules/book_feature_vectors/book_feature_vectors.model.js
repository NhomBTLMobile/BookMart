import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const BookFeatureVectors = sequelize.define(
  'book_feature_vectors',
  {
    book_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    category_vector: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    author_vector: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    format_vector: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    combined_vector: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'book_feature_vectors',
    timestamps: false,
    underscored: true,
  }
)

export default BookFeatureVectors
