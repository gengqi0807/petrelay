const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Request extends Model {}

Request.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    petId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    serviceType: {
      type: DataTypes.ENUM('HOME_VISIT', 'BOARDING'),
      allowNull: false,
    },
    specialReq: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'OPEN',
    },
  },
  {
    sequelize,
    modelName: 'Request',
    tableName: 'requests',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Request;
