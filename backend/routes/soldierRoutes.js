const express = require('express');
const router = express.Router();
const soldierController = require('../controllers/soldierController');
const { requireAuth, isAdmin, isSoldier } = require('../middleware/auth');

// === UNTUK SOLDIER (USER BIASA) ===
// Update profile (misal ganti password)
router.put('/profile', requireAuth, isSoldier, soldierController.updateProfile);

// === UNTUK ADMIN ===
// Mendapatkan semua anggota
router.get('/', requireAuth, isAdmin, soldierController.getAllSoldiers);

// Mendapatkan detail anggota
router.get('/:id', requireAuth, isAdmin, soldierController.getSoldierById);

// Update data anggota (reset password, ganti username)
router.put('/:id', requireAuth, isAdmin, soldierController.updateSoldier);

module.exports = router;
