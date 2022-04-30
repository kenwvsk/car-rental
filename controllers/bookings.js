const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Provider = require('../models/Provider');
const moment = require('moment');
const { now } = require('moment');
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
  //-------------------Check User Input Date ------------------------------
  if (req.body.startDate <= new Date().toISOString()) {
    return res.status(500).json({ success: false, msg: 'You cannot booking in the past' });
  }
  if (req.body.endDate <= req.body.startDate) {
    return res.status(500).json({ success: false, msg: 'Please check your End Date' }); 
  }
  //-----------------------------------------------------------------------
  //-------------------3 Cars at Specifying Date---------------------------
  // add user Id to req.body
  req.body.user = req.user.id;
  // Check for existed booking
  const existedBookings = await Booking.find({ user: req.user.id }); //GET ALL BOOKING from User
  let allStartDate = existedBookings.map((x) => x.startDate);
  let allEndDate = existedBookings.map((x) => x.endDate);
  let dateList = [];
  for (let i in allStartDate) {
    let startDate = moment(allStartDate[i]);
    let endDate = moment(allEndDate[i]);
    while (startDate <= endDate) {
      dateList.push(moment(startDate).format('YYYY-MM-DD'));
      startDate = moment(startDate).add(1, 'days');
    }
  }
  const count = {};
  dateList.forEach((x) => {
    count[x] = (count[x] || 0) + 1;
  });
  // This show number of bookings in specifying date
  console.log(count);
  // return date that already has 3 cars
  let cannotReserve = Object.keys(count).filter((key) => count[key] >= 3); 
  // Check the request date
  let reqDateRange = [];
  let startDate = moment(req.body.startDate);
  let endDate = moment(req.body.endDate);
  while (startDate <= endDate) {
    reqDateRange.push(moment(startDate).format('YYYY-MM-DD'));
    startDate = moment(startDate).add(1, 'days');
  }
  // Check intersection between the request date & cannot reserve date
  let result = reqDateRange.filter(x => cannotReserve.includes(x));
  // If no intersection date, User can create booking
  // If there are any intersection date (run if statement)
  if (result.length != 0 && req.user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      msg: `The user with ID ${req.user.id} has already made 3 cars at date ${result}`,
    });
  }
  //----------------------------------------------------------------------
  try {
    //----------Check that Requested Car is belongs to Provider-------------
    const provider = await Provider.findById(req.body.provider).populate('Cars')
    const existedCar = provider.Cars.map((x) => x._id.toString())
    const checkCar = existedCar.includes(req.body.car)
    if (checkCar == false) {
      throw new Error ('Your requested Car is not in your preferred Provider.')
    }
    //----------------------------------------------------------------------
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
          throw new Error('Car is not available');
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
        reservedDate: car.reservedDate.concat(dateList)
      });
      return res.status(200).json({ success: true, data: booking });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, msg: e.message });
  }
};

// @desc    Update Booking
// @route   POST /api/bookings/:Id
// @access  Private
exports.updateBooking = async (req, res) => {
  //-------------------3 Cars at Specifying Date---------------------------
  // add user Id to req.body
  req.body.user = req.user.id;
  // Check for existed booking
  const existedBookings = await Booking.find({ user: req.user.id });
  let allStartDate = existedBookings.map((x) => x.startDate);
  let allEndDate = existedBookings.map((x) => x.endDate);
  let dateList = [];
  for (let i in allStartDate) {
    let startDate = moment(allStartDate[i]);
    let endDate = moment(allEndDate[i]);
    while (startDate <= endDate) {
      dateList.push(moment(startDate).format('YYYY-MM-DD'));
      startDate = moment(startDate).add(1, 'days');
    }
  }
  const count = {};
  dateList.forEach((x) => {
    count[x] = (count[x] || 0) + 1;
  });
  // This show number of bookings in specifying date
  console.log(count);
  // return date that already has 3 cars
  let cannotReserve = Object.keys(count).filter((key) => count[key] >= 3); 
  // Check the request date
  let reqDateRange = [];
  let startDate = moment(req.body.startDate);
  let endDate = moment(req.body.endDate);
  while (startDate <= endDate) {
    reqDateRange.push(moment(startDate).format('YYYY-MM-DD'));
    startDate = moment(startDate).add(1, 'days');
  }
  // Check intersection between the request date & cannot reserve date
  let result = reqDateRange.filter(x => cannotReserve.includes(x));
  // If no intersection date, User can create booking
  // If there are any intersection date (run if statement)
  if (result.length != 0 && req.user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      msg: `The user with ID ${req.user.id} has already made 3 cars at date ${result}`,
    });
  }
  //----------------------------------------------------------------------
  try {
    //----------Check that Requested Car is belongs to Provider-------------
    const provider = await Provider.findById(req.body.provider).populate('Cars')
    const existedCar = provider.Cars.map((x) => x._id.toString())
    const checkCar = existedCar.includes(req.body.car)
    if (checkCar == false) {
      throw new Error ('Your requested Car is not in your preferred Provider.')
    }
    //----------------------------------------------------------------------
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
          throw new Error('Car is not available');
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
        reservedDate: car.reservedDate.concat(dateList)
      });
      return res.status(200).json({ success: true, data: booking });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, msg: e.message });
  }
};

// @desc    Delete Booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      throw new SyntaxError('Cannot find data.');
    }
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        msg: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }
    // Create Date Range
    let dateList = [];
    let startDate = moment(booking.startDate);
    let endDate = moment(booking.endDate);
    while (startDate <= endDate) {
      dateList.push(moment(startDate).format('YYYY-MM-DD'));
      startDate = moment(startDate).add(1, 'days');
    }
    // Delete reservedDate in Car
    let car = await Car.findById(booking.car);
    for (let i in dateList) {
      car.reservedDate.remove(dateList[i]);
    }
    let updateList = car.reservedDate;
    console.log(updateList);
    let reservedDate = updateList;
    car = await Car.findByIdAndUpdate(booking.car, {
      reservedDate,
    });
    // Delete reservedDate in Car complete
    booking = await booking.remove();
    return res.status(200).json({ success: true, data: {} });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ success: false, msg: 'Cannot delete Booking' });
  }
};

// @desc    Update Booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
try {
  if (!(req.body.startDate || req.body.endDate)) {
    throw new Error ('Please provide update informations')
  }
  let { startDate , endDate } = req.body // cannot change Provider & Car , You have to cancel booking
  let booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw new SyntaxError('Cannot find data.');
  }
  // Make sure user is the booking owner
  if (
    booking.user.toString() !== req.user.id
    && req.user.role !== 'admin'
  ) {
    return res.status(401).json({
      success: false,
      msg: `User ${req.user.id} is not authorized to update this booking`,
    });
  }
  // --------------Delete reservedDate in Car------------
  let deleteList = [];
  let BookingstartDate = moment(booking.startDate);
  let BookingendDate = moment(booking.endDate);
  while (BookingstartDate <= BookingendDate) {
    deleteList.push(moment(BookingstartDate).format('YYYY-MM-DD'));
    BookingstartDate = moment(BookingstartDate).add(1, 'days');
  }
  let car = await Car.findById(booking.car);
  for (let i in deleteList) {
    car.reservedDate.remove(deleteList[i]);
  }
  let updateList = car.reservedDate;
 
  car = await Car.updateOne({ _id: booking.car}, {
        reservedDate: updateList,
  });
  console.log(`Updating ${updateList} to Car ${booking.car.model}`);
  // ------------------------------------------------------
  booking = await Booking.findByIdAndUpdate(req.params.id, { startDate , endDate }, {
    new: true,
    runValidators: true,
  });
  // //  --------------Add reservedDate in Car----------------
  let addList = [];
  startDate = moment(startDate);
  endDate = moment(endDate);
  while (startDate <= endDate) {
    addList.push(moment(startDate).format('YYYY-MM-DD'));
    startDate = moment(startDate).add(1,'days');
  }
  car = await Car.updateOne({ _id:booking.car}, {
    reservedDate: addList.concat(updateList),
  });
  // //  ------------------------------------------------------
  return res.status(200).json({ success: true, data: booking });
} catch (e) {
  console.log(e);
  return res
    .status(500)
    .json({ success: false, msg: e.message});
}
};
