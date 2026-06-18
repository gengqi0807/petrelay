const express = require('express');
const { Op } = require('sequelize');
const { Order, Request, Application, Pet, User, Review } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId) {
      return res.status(400).json({ message: '参数不完整' });
    }
    const application = await Application.findByPk(applicationId);
    if (!application || application.status !== 'ACCEPTED') {
      return res.status(400).json({ message: '申请不可确认' });
    }
    const request = await Request.findByPk(application.requestId);
    if (!request || request.ownerId !== req.user.id) {
      return res.status(403).json({ message: '无权限创建订单' });
    }
    const order = await Order.create({
      requestId: request.id,
      sitterId: application.sitterId,
      totalAmount: application.price,
      orderStatus: 'IN_PROGRESS',
    });
    await request.update({ status: 'CONFIRMED' });
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '创建订单失败' });
  }
});

router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [{ model: Request, as: 'request' }] });
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    if (order.request.ownerId !== req.user.id) {
      return res.status(403).json({ message: '无权限操作' });
    }
    await order.update({ orderStatus: 'COMPLETED' });
    await order.request.update({ status: 'COMPLETED' });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '确认完成失败' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Request, as: 'request', include: [{ model: Pet, as: 'pet' }, { model: User, as: 'owner', attributes: ['id', 'nickname', 'avatar'] }] },
        { model: User, as: 'sitter', attributes: ['id', 'nickname', 'avatar'] },
        { model: Review, as: 'review' },
      ],
      where: {
        [Op.or]: [
          { sitterId: req.user.id },
          { '$request.owner_id$': req.user.id },
        ],
      },
      order: [['created_at', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取订单列表失败' });
  }
});

module.exports = router;
