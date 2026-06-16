const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Order extends Model {}

Order.init(
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
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    orderStatus: {
      type: DataTypes.ENUM('CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'CREATED',
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Order;
