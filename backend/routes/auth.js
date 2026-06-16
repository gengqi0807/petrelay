const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'petrelay-secret';

router.post('/register', async (req, res) => {
  try {
    const { phone, password, role } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: '手机号和密码必填' });
    }
    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ message: '手机号已注册' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ phone, password: hashed, role: role || 'OWNER', nickname: phone });
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: '手机号和密码必填' });
    }
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: '登录失败，手机号或密码错误' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '登录失败' });
  }
});

module.exports = router;
