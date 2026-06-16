const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Application extends Model {}

Application.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    sitterId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    modelName: 'Application',
    tableName: 'applications',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Application;
