const express = require('express');
const {
  getProviders,
  getProvider,
  createProvider,
  deleteProvider,
} = require('../controllers/providers');
const router = express.Router();

router.route('/').get(getProviders).post(createProvider);
router.route('/:id').get(getProvider).delete(deleteProvider);

module.exports = router;