const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { Faq } = require('../models');
const { requireAuth } = require('../middleware/auth');

const controller = crudFactory(Faq, {
  searchFields: ['question'],
  defaultOrder: [['display_order', 'ASC']],
  attachAdmin: true,
});

router.get('/', controller.index);
router.get('/:id', controller.show);

router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
