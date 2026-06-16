const express = require('express');
const { Application, Request, User, Pet } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { requestId, price, message } = req.body;
    if (!requestId || !price) {
      return res.status(400).json({ message: '参数不完整' });
    }
    const request = await Request.findByPk(requestId);
    if (!request || request.status !== 'OPEN') {
      return res.status(400).json({ message: '需求不可申请' });
    }
    const application = await Application.create({
      requestId,
      sitterId: req.user.id,
      price,
      message,
      status: 'PENDING',
    });
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
    await application.update({ status: 'ACCEPTED' });
    await Request.update({ status: 'PENDING' }, { where: { id: application.requestId } });
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '接受申请失败' });
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
        { model: User, as: 'sitter', attributes: ['id', 'nickname', 'avatar', 'role'] },
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
