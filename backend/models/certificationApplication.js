const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class CertificationApplication extends Model {}

CertificationApplication.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    documentUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'CertificationApplication',
    tableName: 'certification_applications',
    timestamps: true,
    underscored: true,
  }
);

module.exports = CertificationApplication;
