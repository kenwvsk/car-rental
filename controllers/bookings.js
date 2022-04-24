const Booking = require('../models/Booking');
const Car = require('../models/Car');
const moment = require('moment');
// @desc    Get single Booking
// @route   api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'provider',
        select: 'name address tel',
      })
      .populate({
        path: 'car',
        select: 'model price',
      });
    if (!booking) {
      return res.status(404).json({
        success: false,
        msg: `No booking with the id ${req.params.id}`,
      });
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, msg: 'Cannot find Booking' });
  }
};

// @desc    Get All Bookings
// @route   api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  let query;
  // General users can see only their bookings
  if (req.user.role !== 'admin') {
    query = Booking.find({ user: req.user.id })
      .populate({
        path: 'provider',
        select: 'name address tel',
      })
      .populate({
        path: 'car',
        select: 'model price',
      });
  } else {
    // If you are an admin, you can see all!
    query = Booking.find()
      .populate({
        path: 'user',
        select: 'name tel email role',
      })
      .populate({
        path: 'provider',
        select: 'name address tel',
      })
      .populate({
        path: 'car',
        select: 'model price',
      });
  }
  try {
    const bookings = await query;
    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// @desc    Add Booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  //---------------------------------------------------------------------
  // add user Id to req.body
  req.body.user = req.user.id;
  // Check for existed booking
  const existedBookings = await Booking.find({ user: req.user.id });
  // If the user is not an admin, they can only create 3 bookings.
  if (existedBookings.length >= 3 && req.user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      msg: `The user with ID ${req.user.id} has already made 3 bookings`,
    });
  }
  //----------------------------------------------------------------------
  try {
    // Create Date Range
    let dateList = [];
    let startDate = moment(req.body.startDate);
    let endDate = moment(req.body.endDate);
    while (startDate <= endDate) {
      dateList.push(moment(startDate).format('YYYY-MM-DD'));
      startDate = moment(startDate).add(1, 'days');
    }
    // Find Cars
    let car = await Car.findById(req.body.car);
    // Check Reserved Date
    if (car.reservedDate != []) {
      for (let i in dateList) {
        if (car.reservedDate.find((x) => x === dateList[i])) {
          throw Error ('Car is not available');
        }
      }
      const booking = await Booking.create(req.body);
      car = await Car.findByIdAndUpdate(req.body.car, {
        reservedDate: car.reservedDate.concat(dateList),
      });
      return res.status(200).json({ success: true, data: booking });
    } else {
      const booking = await Booking.create(req.body);
      car = await Car.findByIdAndUpdate(req.body.car, {
        reservedDate: car.reservedDate.concat(dateList),
      });
      return res.status(200).json({ success: true, data: booking });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ success: false, msg: e.message});
  }
};

// Delete Booking, Update Booking