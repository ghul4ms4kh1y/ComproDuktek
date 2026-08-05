const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { News } = require('../models');
const { requireAuth } = require('../middleware/auth');

const controller = crudFactory(News, {
  searchFields: ['title'],
  defaultOrder: [['news_date', 'DESC']],
  attachAdmin: true,
  fileField: 'thumbnail',
});

// Publik
router.get('/', controller.index);
router.get('/:id', controller.show);

// Admin (proteksi)
router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
