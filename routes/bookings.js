const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  deleteBooking,
  updateBooking,
} = require('../controllers/bookings');
const { protect, authorize } = require('../middleware/users');
const router = express.Router();

router.route('/').get(protect, getBookings).post(protect, createBooking);
router
  .route('/:id')
  .get(protect, getBooking)
  .delete(protect, authorize('admin', 'user'), deleteBooking)
  .put(protect, authorize('admin', 'user'), updateBooking);

module.exports = router;
