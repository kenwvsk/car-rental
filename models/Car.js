const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  model: {
    type: String,
    required: [true, 'Please add an model'],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  reservedDate: {
    type: Array,
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Provider',
    required: true,
  },
});

module.exports = mongoose.model('Car', CarSchema);
