const express = require('express');
const router = express.Router();
const crudFactory = require('../controllers/crudFactory');
const { Gallery } = require('../models');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const controller = crudFactory(Gallery, {
  searchFields: ['description'],
  defaultOrder: [['gallery_date', 'DESC']],
  attachAdmin: true,
  fileField: 'image',
});

router.get('/', controller.index);
router.get('/:id', controller.show);

router.post('/', requireAuth, upload.single('image'), controller.create);
router.put('/:id', requireAuth, upload.single('image'), controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
