const express = require('express');
const { Application, Request, User, Pet, Order } = require('../models');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const { createNotification } = require('./notification');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { requestId, message, price } = req.body;
    if (!requestId) {
      return res.status(400).json({ message: '参数不完整' });
    }
    const request = await Request.findByPk(requestId);
    if (!request || request.status !== 'OPEN') {
      return res.status(400).json({ message: '需求不可申请' });
    }
    if (request.ownerId === req.user.id) {
      return res.status(403).json({ message: '不能申请自己的需求' });
    }
    const existing = await Application.findOne({ where: { requestId, sitterId: req.user.id } });
    if (existing) {
      return res.status(409).json({ message: '你已申请过该需求' });
    }
    const sitter = await User.findByPk(req.user.id);
    const application = await Application.create({
      requestId,
      sitterId: req.user.id,
      price: price || request.price,
      message,
      status: 'PENDING',
    });
    await createNotification(
      request.ownerId,
      '收到新的接单申请',
      `宠托师${sitter?.nickname || '用户'}申请了您的托管需求，报价¥${price || request.price}`,
      'APPLICATION',
      application.id
    );
    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '提交申请失败' });
  }
});

router.post('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, { include: [{ model: Request, as: 'request' }] });
    if (!application) {
      return res.status(404).json({ message: '申请不存在' });
    }
    if (application.request.ownerId !== req.user.id) {
      return res.status(403).json({ message: '无权限操作' });
    }
    if (application.request.status !== 'OPEN') {
      return res.status(400).json({ message: '该需求当前不可接受' });
    }
    await application.update({ status: 'ACCEPTED' });
    await Application.update(
      { status: 'REJECTED' },
      { where: { requestId: application.requestId, id: { [Op.ne]: application.id }, status: 'PENDING' } }
    );
    await Request.update({ status: 'CONFIRMED' }, { where: { id: application.requestId } });
    const order = await Order.create({
      requestId: application.requestId,
      sitterId: application.sitterId,
      totalAmount: application.price,
      orderStatus: 'IN_PROGRESS',
    });
    await createNotification(
      application.sitterId,
      '接单申请已通过',
      `您申请的托管需求已被宠物主人接受，请及时查看订单详情`,
      'ORDER',
      order.id
    );
    res.json({ application, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '接受申请失败' });
  }
});

router.post('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, { include: [{ model: Request, as: 'request' }] });
    if (!application) {
      return res.status(404).json({ message: '申请不存在' });
    }
    if (application.request.ownerId !== req.user.id) {
      return res.status(403).json({ message: '无权限操作' });
    }
    await application.update({ status: 'REJECTED' });
    await createNotification(
      application.sitterId,
      '接单申请被拒绝',
      `您申请的托管需求未被接受，继续浏览其他需求吧`,
      'APPLICATION',
      application.id
    );
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '拒绝申请失败' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, { include: [{ model: Request, as: 'request' }] });
    if (!application) {
      return res.status(404).json({ message: '申请不存在' });
    }
    if (application.sitterId !== req.user.id) {
      return res.status(403).json({ message: '无权限操作' });
    }
    if (application.status !== 'PENDING') {
      return res.status(400).json({ message: '仅可取消待处理申请' });
    }
    await application.destroy();
    res.json({ message: '取消申请成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '取消申请失败' });
  }
});


router.get('/received', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: Request,
          as: 'request',
          where: { ownerId: req.user.id },
        },
        { model: User, as: 'sitter', attributes: ['id', 'nickname', 'avatar', 'role', 'isCertified'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取申请列表失败' });
  }
});

router.get('/received/:requestId', authMiddleware, async (req, res) => {
  try {
    const request = await Request.findOne({
      where: { id: req.params.requestId, ownerId: req.user.id },
    });
    if (!request) {
      return res.status(404).json({ message: '需求未找到或无权限' });
    }
    const applications = await Application.findAll({
      where: { requestId: req.params.requestId },
      include: [
        { model: User, as: 'sitter', attributes: ['id', 'nickname', 'avatar', 'role', 'isCertified'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取申请列表失败' });
  }
});

router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { sitterId: req.user.id },
      include: [
        { model: Request, as: 'request', include: [{ model: Pet, as: 'pet' }] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取我的申请失败' });
  }
});

module.exports = router;
