const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CertificationApplication, User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/certifications');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: async (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const username = (req.user?.id || 'user').toString();
    cb(null, `cert_${username}_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post('/', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传认证材料' });
    }

    const existing = await CertificationApplication.findOne({
      where: { userId: req.user.id, status: 'PENDING' },
    });
    if (existing) {
      return res.status(409).json({ message: '已有待审核的认证申请' });
    }

    const cert = await CertificationApplication.create({
      userId: req.user.id,
      documentUrl: `/uploads/certifications/${req.file.filename}`,
      status: 'PENDING',
    });
    res.status(201).json(cert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '认证申请提交失败' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const cert = await CertificationApplication.findOne({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(cert || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取认证信息失败' });
  }
});

router.post('/:id/approve', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '无权限操作' });
    }
    const cert = await CertificationApplication.findByPk(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: '认证申请不存在' });
    }
    await cert.update({ status: 'APPROVED', remark: req.body.remark || '' });
    const user = await User.findByPk(cert.userId);
    if (user) {
      await user.update({ isCertified: true });
    }
    res.json(cert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '认证审批失败' });
  }
});

router.post('/:id/reject', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '无权限操作' });
    }
    const cert = await CertificationApplication.findByPk(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: '认证申请不存在' });
    }
    await cert.update({ status: 'REJECTED', remark: req.body.remark || '' });
    res.json(cert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '认证拒绝失败' });
  }
});

module.exports = router;
