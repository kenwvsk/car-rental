const express = require('express');
const {
  getCars,
  getCar,
  createCar,
  deleteCar,
} = require('../controllers/cars');
const {protect, authorize} = require('../middleware/users');
const router = express.Router();

router.route('/').get(getCars).post(protect, authorize('admin'), createCar);
router.route('/:id').get(getCar).delete(protect, authorize('admin'), deleteCar);

module.exports = router;
