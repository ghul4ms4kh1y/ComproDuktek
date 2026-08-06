const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const orgStructureController = require('../controllers/orgStructureController');
const { OrgStructure } = require('../models');
const { requireAuth } = require('../middleware/auth');

const controller = crudFactory(OrgStructure, {
  searchFields: ['name', 'position', 'rank'],
  defaultOrder: [['display_order', 'ASC']],
  attachAdmin: true,
  fileField: 'photo',
});

router.get('/', controller.index);

// PENTING: route statis '/reorder' harus didefinisikan SEBELUM '/:id'.
router.put('/reorder', requireAuth, orgStructureController.reorder);

router.get('/:id', controller.show);

router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, orgStructureController.remove);

module.exports = router;
