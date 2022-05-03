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
    console.log('request: GET ALL CARS')
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
    console.log('request: GET CAR BY ID')
    return res.status(200).json({success: true, data: car})
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}

// @des      Create car
// @route    POST /api/cars/
// @access   Private

const createCar = async (req,res) => {
  try {
    const car = await Car.create(req.body);
    console.log('request: CREATE CAR')
    return res.status(201).json({success: true, data: car})
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}

// @des      Update Car by ID
// @route    PUT /api/cars/:id
// @access   Private
const updateCar = async (req,res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body,{
      new: true,
      runValidators: true
  });
  if(!car){
      return res.status(400).json({success: false});
  }
  res. status(200).json({success: true, data: car});
  }catch(err){
      res.status(400).json({success: false});
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
    console.log('request: DELETE CAR')
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
  updateCar,
  deleteCar,
};
