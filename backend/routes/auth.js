const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'petrelay-secret';

const verificationCodes = {};

router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: '手机号必填' });
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    verificationCodes[phone] = { code, expiresAt: Date.now() + 5 * 60 * 1000 };
    console.log(`[验证码] 手机号 ${phone} 的验证码为: ${code}`);
    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '发送验证码失败' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { phone, password, role, verificationCode } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: '手机号和密码必填' });
    }
    if (!verificationCode) {
      return res.status(400).json({ message: '验证码必填' });
    }
    const stored = verificationCodes[phone];
    if (!stored || stored.code !== verificationCode || Date.now() > stored.expiresAt) {
      return res.status(400).json({ message: '验证码无效或已过期' });
    }
    delete verificationCodes[phone];

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
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remaining = Math.ceil((new Date(user.lockedUntil) - new Date()) / 1000 / 60);
      return res.status(423).json({ message: `账户已锁定，请${remaining}分钟后重试` });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const failCount = (user.loginFailCount || 0) + 1;
      if (failCount >= 3) {
        const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
        await user.update({ loginFailCount: 0, lockedUntil });
        return res.status(423).json({ message: '登录失败3次，账户已锁定5分钟' });
      }
      await user.update({ loginFailCount: failCount });
      return res.status(401).json({ message: `登录失败，手机号或密码错误（${failCount}/3）` });
    }
    await user.update({ loginFailCount: 0, lockedUntil: null });
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '登录失败' });
  }
});

module.exports = router;
