const express = require('express');
const { Notification } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取通知失败' });
  }
});

router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取未读数失败' });
  }
});

router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }
    await notification.update({ isRead: true });
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '标记已读失败' });
  }
});

router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ message: '全部标记已读' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '标记已读失败' });
  }
});

async function createNotification(userId, title, content, type, relatedId) {
  try {
    await Notification.create({ userId, title, content, type, relatedId });
  } catch (error) {
    console.error('创建通知失败:', error);
  }
}

module.exports = { router, createNotification };