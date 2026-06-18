const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models');
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
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
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
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '更新用户信息失败' });
  }
});

module.exports = router;
