const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Pet extends Model {}

Pet.init(
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
    petName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    petType: {
      type: DataTypes.ENUM('DOG', 'CAT', 'OTHER'),
      allowNull: false,
    },
    petAge: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    healthInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Pet',
    tableName: 'pets',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Pet;
