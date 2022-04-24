const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Provider',
    required: true,
  },
  car: {
    type: mongoose.Schema.ObjectId,
    ref: 'Car',
    required: true,
  },
  createdDate:{
    type: Date,
    default: Date.now
}
});

module.exports = mongoose.model('Booking', BookingSchema);