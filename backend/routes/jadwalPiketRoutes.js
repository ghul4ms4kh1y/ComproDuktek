const express = require('express');
const router = express.Router();
const jadwalPiketController = require('../controllers/jadwalPiketController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole('admin'));

router.post('/generate', jadwalPiketController.generate);
router.delete('/reset', jadwalPiketController.reset);
router.get('/', jadwalPiketController.index);
router.get('/tanggal/:date', jadwalPiketController.showByDate);
router.get('/:id', jadwalPiketController.show);
router.put('/:id', jadwalPiketController.update);
router.delete('/:id', jadwalPiketController.remove);

module.exports = router;
