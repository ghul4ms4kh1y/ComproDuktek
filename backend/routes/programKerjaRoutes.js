const express = require('express');
const router = express.Router();
const programKerjaController = require('../controllers/programKerjaController');
const { requireAuth, requireRole, isSoldier } = require('../middleware/auth');
const { programKerjaValidation } = require('../middleware/validation');

// All endpoints require authentication
router.use(requireAuth);

// GET accessible by admin and soldier (scoping is done in controller)
router.get('/', programKerjaController.index);
router.get('/:id', programKerjaController.show);

// POST, PUT, DELETE only for admin
router.post('/', requireRole('admin'), programKerjaValidation, programKerjaController.create);
router.put('/:id', requireRole('admin'), programKerjaValidation, programKerjaController.update);
router.delete('/:id', requireRole('admin'), programKerjaController.remove);

// Izinkan soldier melakukan update proker miliknya sendiri (misal: tandai selesai)
router.put('/:id/soldier-update', requireAuth, isSoldier, programKerjaController.soldierUpdate);

module.exports = router;
