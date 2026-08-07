const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { News } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { newsValidation } = require('../middleware/validation');

const controller = crudFactory(News, {
  searchFields: ['title', 'content', 'category'],
  defaultOrder: [
    ['news_date', 'DESC'],
    ['category', 'ASC']
  ],
  attachAdmin: true,
  fileField: 'thumbnail',
});

// Publik
router.get('/', controller.index);
router.get('/:id', controller.show);

// Admin (proteksi)
router.post('/', requireAuth, newsValidation, controller.create);
router.put('/:id', requireAuth, newsValidation, controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;