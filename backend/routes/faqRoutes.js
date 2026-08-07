const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const faqController = require('../controllers/faqController');
const { Faq } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { faqValidation } = require('../middleware/validation');

const controller = crudFactory(Faq, {
  searchFields: ['question'],
  defaultOrder: [['display_order', 'ASC']],
  attachAdmin: true,
});

router.get('/', controller.index);

// PENTING: route statis '/reorder' harus didefinisikan SEBELUM '/:id',
// kalau tidak Express akan menganggap 'reorder' sebagai nilai :id.
router.put('/reorder', requireAuth, faqController.reorder);

router.get('/:id', controller.show);

router.post('/', requireAuth, faqValidation, controller.create);
router.put('/:id', requireAuth, faqValidation, controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
