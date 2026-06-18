const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { ServiceRecord, Order, Request } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const serviceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/service-images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, baseName);
  },
});

const upload = multer({ storage: serviceStorage });

router.post('/:orderId/records', authMiddleware, upload.array('images', 9), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content } = req.body;
    const order = await Order.findByPk(orderId, { include: [{ model: Request, as: 'request' }] });
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    if (order.sitterId !== req.user.id) {
      return res.status(403).json({ message: '无权限提交记录' });
    }

    if (order.orderStatus !== 'IN_PROGRESS') {
      return res.status(400).json({ message: '当前订单无法上传托管记录' });
    }

    const images = req.files?.map((file) => `/uploads/service-images/${file.filename}`) || [];
    const record = await ServiceRecord.create({
      orderId: order.id,
      content,
      images: images.length ? JSON.stringify(images) : null,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '创建服务记录失败' });
  }
});

router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, { include: [{ model: Request, as: 'request' }] });
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    if (order.sitterId !== req.user.id && order.request?.ownerId !== req.user.id) {
      return res.status(403).json({ message: '无权限查看托管记录' });
    }

    const records = await ServiceRecord.findAll({
      where: { orderId: order.id },
      order: [['created_at', 'ASC']],
    });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '读取托管记录失败' });
  }
});

module.exports = router;
