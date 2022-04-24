const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  // deleteBooking,
} = require('../controllers/bookings');
const {protect, authorize} = require('../middleware/users');
const router = express.Router();

router.route('/').get(getBookings).post(protect, createBooking);
router.route('/:id').get(getBooking);
// .delete(protect, authorize('admin'), deleteBooking);

module.exports = router;