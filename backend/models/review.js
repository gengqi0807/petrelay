const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Review extends Model {}

Review.init(
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
    reviewerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Review;
