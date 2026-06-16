const express = require('express');
const { Review, Order } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    if (!orderId || !rating) {
      return res.status(400).json({ message: '参数不完整' });
    }
    const order = await Order.findByPk(orderId);
    if (!order || order.orderStatus !== 'COMPLETED') {
      return res.status(400).json({ message: '订单无法评价' });
    }
    const existing = await Review.findOne({ where: { orderId } });
    if (existing) {
      return res.status(409).json({ message: '已评价' });
    }
    const review = await Review.create({ orderId, rating, comment });
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
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取评价失败' });
  }
});

module.exports = router;
