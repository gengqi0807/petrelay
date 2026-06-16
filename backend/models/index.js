const sequelize = require('../config/database');
const User = require('./user');
const Pet = require('./pet');
const Request = require('./request');
const Application = require('./application');
const Order = require('./order');
const ServiceRecord = require('./serviceRecord');
const Review = require('./review');

User.hasMany(Pet, { foreignKey: 'ownerId', as: 'pets' });
Pet.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Request, { foreignKey: 'ownerId', as: 'requests' });
Request.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Request.hasMany(Application, { foreignKey: 'requestId', as: 'applications' });
Application.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

Pet.hasMany(Request, { foreignKey: 'petId', as: 'requests' });
Request.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });

User.hasMany(Application, { foreignKey: 'sitterId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'sitterId', as: 'sitter' });

Request.hasOne(Order, { foreignKey: 'requestId', as: 'order' });
Order.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

User.hasMany(Order, { foreignKey: 'sitterId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'sitterId', as: 'sitter' });

Order.hasMany(ServiceRecord, { foreignKey: 'orderId', as: 'records' });
ServiceRecord.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Order.hasOne(Review, { foreignKey: 'orderId', as: 'review' });
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  sequelize,
  User,
  Pet,
  Request,
  Application,
  Order,
  ServiceRecord,
  Review,
};
