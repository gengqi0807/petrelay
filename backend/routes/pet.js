const express = require('express');
const { Pet } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { petName, petType, petAge, healthInfo } = req.body;
    if (!petName || !petType) {
      return res.status(400).json({ message: '宠物名称和类型必填' });
    }
    const pet = await Pet.create({
      ownerId: req.user.id,
      petName,
      petType,
      petAge,
      healthInfo,
    });
    res.status(201).json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '创建宠物失败' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const pets = await Pet.findAll({ where: { ownerId: req.user.id } });
    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取宠物列表失败' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const pet = await Pet.findOne({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!pet) {
      return res.status(404).json({ message: '宠物未找到' });
    }
    res.json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取宠物信息失败' });
  }
});

module.exports = router;
