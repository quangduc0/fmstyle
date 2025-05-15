const express = require("express");
const Promotion = require("../models/Promotion");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();
// POST /api/promotions
router.post('/', protect, admin, async (req, res) => {
  try {
    const promo = new Promotion({ ...req.body, user: req.user._id });
    await promo.save();
    res.status(201).json(promo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/promotions/:id
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }
    const updates = req.body;
    Object.assign(promo, updates);
    await promo.save();
    res.json(promo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/promotions/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }
    await promo.deleteOne();
    res.json({ message: 'Đã xóa khuyến mãi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/promotions
router.get('/', async (req, res) => {
  try {
    const promos = await Promotion.find();
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/promotions/active
router.get('/active', async (req, res) => {
  const now = new Date();
  try {
    const active = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    res.json(active);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;