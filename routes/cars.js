const express = require('express');
const {
  getCars,
  getCar,
  createCar,
  deleteCar,
} = require('../controllers/cars');
const router = express.Router();

router.route('/').get(getCars).post(createCar);
router.route('/:id').get(getCar).delete(deleteCar);

module.exports = router;
