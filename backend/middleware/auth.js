const jwt = require('jsonwebtoken');
const { User } = require('../models');

const jwtSecret = process.env.JWT_SECRET || 'petrelay-secret';

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未授权访问' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token无效或已过期' });
  }
};
