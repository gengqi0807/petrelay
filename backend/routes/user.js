const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User, Review, Order, CertificationApplication, Pet, Request, Application, ServiceRecord, Notification } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: async (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const user = await User.findByPk(req.user.id);
    const username = (user?.nickname || user?.phone || `user${req.user.id}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = `${username}_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({ storage: avatarStorage });

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password', 'loginFailCount', 'lockedUntil'] } });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

router.put('/me', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const { nickname, address } = req.body;
    const updateData = { nickname, address };
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    } else if (req.body.avatar) {
      updateData.avatar = req.body.avatar;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    await user.update(updateData);
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password', 'loginFailCount', 'lockedUntil'] } });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '更新用户信息失败' });
  }
});

router.get('/sitter/:id', async (req, res) => {
  try {
    const sitter = await User.findByPk(req.params.id, {
      attributes: ['id', 'nickname', 'avatar', 'address', 'role', 'isCertified', 'created_at'],
    });
    if (!sitter || sitter.role !== 'SITTER') {
      return res.status(404).json({ message: '宠托师不存在' });
    }
    const reviewData = await Review.findAll({
      include: [{ model: Order, as: 'order', where: { sitterId: sitter.id } }],
      order: [['created_at', 'DESC']],
    });
    const completedOrders = await Order.count({
      where: { sitterId: sitter.id, orderStatus: 'COMPLETED' },
    });
    const avgRating = reviewData.length
      ? Number((reviewData.reduce((sum, r) => sum + r.rating, 0) / reviewData.length).toFixed(1))
      : 0;
    res.json({ ...sitter.toJSON(), avgRating, reviewCount: reviewData.length, completedOrders, reviews: reviewData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取宠托师信息失败' });
  }
});

router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    const userId = user.id;

    const ownerRequests = await Request.findAll({ where: { ownerId: userId } });
    const requestIds = ownerRequests.map(r => r.id);

    if (requestIds.length > 0) {
      const requestOrders = await Order.findAll({ where: { requestId: requestIds } });
      const requestOrderIds = requestOrders.map(o => o.id);
      if (requestOrderIds.length > 0) {
        await ServiceRecord.destroy({ where: { orderId: requestOrderIds } });
        await Review.destroy({ where: { orderId: requestOrderIds } });
        await Order.destroy({ where: { requestId: requestIds } });
      }
      await Application.destroy({ where: { requestId: requestIds } });
      await Request.destroy({ where: { ownerId: userId } });
    }

    const sitterOrders = await Order.findAll({ where: { sitterId: userId } });
    const sitterOrderIds = sitterOrders.map(o => o.id);
    if (sitterOrderIds.length > 0) {
      await ServiceRecord.destroy({ where: { orderId: sitterOrderIds } });
      await Review.destroy({ where: { orderId: sitterOrderIds } });
      await Order.destroy({ where: { sitterId: userId } });
    }

    await Application.destroy({ where: { sitterId: userId } });
    await Pet.destroy({ where: { ownerId: userId } });
    await CertificationApplication.destroy({ where: { userId } });
    await Notification.destroy({ where: { userId } });

    await user.destroy();
    res.json({ message: '账号已注销' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '注销账号失败' });
  }
});

module.exports = router;
