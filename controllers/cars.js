const Car = require('../models/Car');

// @des      Get all cars
// @route    GET /api/cars
// @access   Public

const getCars = async (req,res) => {
  try {
    const cars = await Car.find().populate({
      path: 'provider',
      select: '_id name address tel',
    });
    console.log('GET ALL' + cars)
    return res.status(200).json({success: true, data: cars})
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}

// @des      Get car by UD
// @route    GET /api/cars/:id
// @access   Public

const getCar = async (req,res) => {
  try {
    const car = await Car.findById(req.params.id).populate({
      path: 'provider',
      select: '_id name address tel',
    });
    if (!car) {
      throw new SyntaxError('Cannot find data');
    }
    console.log('GET BY ID' + car)
    return res.status(200).json({success: true, data: car})
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}

// @des      Create car
// @route    POST /api/cars/
// @access   Public

const createCar = async (req,res) => {
  try {
    const car = await Car.create(req.body);
    console.log('POST' + car)
    return res.status(200).json({success: true, data: car})
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}

// @des      Delete car by ID
// @route    DELETE /api/cars/:id
// @access   Public

const deleteCar = async (req,res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      throw new SyntaxError('Cannot find data');
    }
    console.log('DELETE' + car)
    car.remove();
    return res.status(200).json({success: true, data: {} })
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}
module.exports = {
  getCars,
  getCar,
  createCar,
  deleteCar,
};
