const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ServiceRecord extends Model {}

ServiceRecord.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recordTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ServiceRecord',
    tableName: 'service_records',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ServiceRecord;
