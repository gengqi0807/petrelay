const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('OWNER', 'SITTER', 'ADMIN'),
      allowNull: false,
      defaultValue: 'OWNER',
    },
    isCertified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;
