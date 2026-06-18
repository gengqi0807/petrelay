const express = require('express');
const { Review, Order, Request, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const { createNotification } = require('./notification');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    if (!orderId || !rating) {
      return res.status(400).json({ message: '参数不完整' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: '评分需在1-5之间' });
    }
    const order = await Order.findByPk(orderId, { include: [{ model: Request, as: 'request' }] });
    if (!order || order.orderStatus !== 'COMPLETED') {
      return res.status(400).json({ message: '订单无法评价，需先确认完成' });
    }
    if (order.request.ownerId !== req.user.id) {
      return res.status(403).json({ message: '仅宠物主人可评价' });
    }
    const existing = await Review.findOne({ where: { orderId } });
    if (existing) {
      return res.status(409).json({ message: '已评价' });
    }
    const review = await Review.create({ orderId, rating, comment, reviewerId: req.user.id });
    await createNotification(
      order.sitterId,
      '收到新的评价',
      `宠物主人对您的服务给出了${rating}星评价`,
      'REVIEW',
      review.id
    );
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '提交评价失败' });
  }
});

router.get('/by-sitter/:sitterId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [{ model: Order, as: 'order', where: { sitterId: req.params.sitterId } }],
      order: [['created_at', 'DESC']],
    });
    const avgRating = reviews.length
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 0;
    res.json({ reviews, avgRating, reviewCount: reviews.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取评价失败' });
  }
});

module.exports = router;
