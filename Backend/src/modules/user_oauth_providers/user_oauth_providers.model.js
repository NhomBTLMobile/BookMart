import { DataTypes } from 'sequelize'
import { sequelize } from '../../config/database.js'

const UserOauthProviders = sequelize.define(
  'user_oauth_providers',
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
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [0, 255] },
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'user_oauth_providers',
    timestamps: false,
    underscored: true,
  }
)

export default UserOauthProviders
