const express = require('express');
const { Pet, Request, Order, Application, Review } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'OWNER') {
      const [petCount, requestCount, inProgressOrders, completedOrders] = await Promise.all([
        Pet.count({ where: { ownerId: req.user.id } }),
        Request.count({ where: { ownerId: req.user.id } }),
        Order.count({
          where: { orderStatus: 'IN_PROGRESS' },
          include: [{ model: Request, as: 'request', where: { ownerId: req.user.id } }],
        }),
        Order.count({
          where: { orderStatus: 'COMPLETED' },
          include: [{ model: Request, as: 'request', where: { ownerId: req.user.id } }],
        }),
      ]);

      return res.json({
        myRequests: requestCount,
        inProgressOrders,
        completedOrders,
        myPets: petCount,
      });
    }

    if (req.user.role === 'SITTER') {
      const [pendingApplications, inProgressOrders, completedOrders, reviews] = await Promise.all([
        Application.count({ where: { sitterId: req.user.id, status: 'PENDING' } }),
        Order.count({ where: { sitterId: req.user.id, orderStatus: 'IN_PROGRESS' } }),
        Order.count({ where: { sitterId: req.user.id, orderStatus: 'COMPLETED' } }),
        Review.findAll({
          include: [{ model: Order, as: 'order', where: { sitterId: req.user.id } }],
        }),
      ]);

      const avgRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      return res.json({
        pendingApplications,
        inProgressOrders,
        completedOrders,
        avgRating: Number(avgRating.toFixed(1)),
      });
    }

    res.status(400).json({ message: '未知角色' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取仪表盘数据失败' });
  }
});

module.exports = router;
