const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { News } = require('../models');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

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
router.post('/', requireAuth, upload.single('thumbnail'), controller.create);
router.put('/:id', requireAuth, upload.single('thumbnail'), controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
