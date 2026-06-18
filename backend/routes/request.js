const express = require('express');
const { Op } = require('sequelize');
const { Request, Pet, User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { petId, startTime, endTime, serviceType, specialReq, price, address } = req.body;
    if (!petId || !startTime || !endTime || !serviceType || price === undefined || price === null) {
      return res.status(400).json({ message: '参数不完整' });
    }
    const request = await Request.create({
      ownerId: req.user.id,
      petId,
      startTime,
      endTime,
      serviceType,
      specialReq,
      price,
      address: address || req.user.address || null,
      status: 'OPEN',
    });
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '发布托管需求失败' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { serviceType, petType, status } = req.query;
    const where = { status: status || 'OPEN' };
    if (serviceType) where.serviceType = serviceType;
    if (petType) {
      const pets = await Pet.findAll({ where: { petType } });
      const petIds = pets.map((pet) => pet.id);
      where.petId = petIds.length > 0 ? petIds : -1;
    }
    const requests = await Request.findAll({
      where,
      include: [
        { model: Pet, as: 'pet' },
        { model: User, as: 'owner', attributes: ['id', 'nickname', 'avatar', 'address'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取托管需求失败' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { ownerId: req.user.id },
      include: [
        { model: Pet, as: 'pet' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取我的需求失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [
        { model: Pet, as: 'pet' },
        { model: User, as: 'owner', attributes: ['id', 'nickname', 'avatar', 'address'] },
      ],
    });
    if (!request) {
      return res.status(404).json({ message: '需求未找到' });
    }
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取需求详情失败' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await Request.findOne({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!request) {
      return res.status(404).json({ message: '需求未找到' });
    }
    if (['CONFIRMED', 'COMPLETED'].includes(request.status)) {
      return res.status(400).json({ message: '当前需求不可删除' });
    }
    await Request.destroy({ where: { id: request.id } });
    res.json({ message: '删除需求成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '删除需求失败' });
  }
});

module.exports = router;
