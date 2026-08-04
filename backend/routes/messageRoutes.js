const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');

// Publik: submit form Kontak
router.post(
  '/',
  [
    body('sender_name').trim().notEmpty().withMessage('Nama wajib diisi.'),
    body('sender_email').isEmail().withMessage('Format email tidak valid.'),
    body('subject').trim().notEmpty().withMessage('Subjek wajib diisi.'),
    body('message').trim().notEmpty().withMessage('Pesan wajib diisi.'),
  ],
  messageController.submit
);

// Admin: Kotak Masuk
router.get('/', requireAuth, messageController.index);
router.get('/:id', requireAuth, messageController.show);
router.delete('/:id', requireAuth, messageController.remove);

module.exports = router;
