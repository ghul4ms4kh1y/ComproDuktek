const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { Product } = require('../models');
const { requireAuth } = require('../middleware/auth');

const controller = crudFactory(Product, {
  searchFields: ['name', 'category', 'unit_pengampu'],
  attachAdmin: true,
  fileField: 'image',
});

router.get('/', controller.index);
router.get('/:id', controller.show);

router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
