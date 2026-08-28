const express = require('express');
const router = express.Router();
const jadwalPiketController = require('../controllers/jadwalPiketController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/calendar', requireRole('admin', 'soldier'), jadwalPiketController.calendar);
router.post('/generate', requireRole('admin'), jadwalPiketController.generate);
router.delete('/reset', requireRole('admin'), jadwalPiketController.reset);
router.get('/', requireRole('admin'), jadwalPiketController.index);
router.get('/tanggal/:date', requireRole('admin'), jadwalPiketController.showByDate);
router.get('/:id', requireRole('admin'), jadwalPiketController.show);
router.put('/:id', requireRole('admin'), jadwalPiketController.update);
router.delete('/:id', requireRole('admin'), jadwalPiketController.remove);
router.put('/:id/usulan', requireRole('soldier'), jadwalPiketController.ajukanUsulanStatus);
router.put('/:id/review-usulan', requireRole('admin'), jadwalPiketController.reviewUsulanStatus);

module.exports = router;
