const express = require('express');
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { nickname, avatar, address } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    await user.update({ nickname, avatar, address });
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '更新用户信息失败' });
  }
});

module.exports = router;
