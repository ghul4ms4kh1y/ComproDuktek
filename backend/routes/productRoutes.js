const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { Product } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');

const controller = crudFactory(Product, {
  searchFields: ['name', 'category', 'unit_pengampu'],
  attachAdmin: true,
  fileField: 'image',
});

router.get('/', controller.index);
router.get('/:id', controller.show);

router.post('/', requireAuth, productValidation, controller.create);
router.put('/:id', requireAuth, productValidation, controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
