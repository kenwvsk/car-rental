const Provider = require('../models/Provider');

// @des      Get all Providers
// @route    GET /api/providers
// @access   Public

const getProviders = async (req,res) => {
  try {
    const providers = await Provider.find().populate('Cars');
    console.log('GET ALL' + providers)
    return res.status(200).json({success: true, data: providers})
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}

// @des      Get Provider by UD
// @route    GET /api/providers/:id
// @access   Public

const getProvider = async (req,res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('Cars');
    if (!provider) {
      throw new SyntaxError('Cannot find data');
    }
    console.log('GET by ID' + provider)
    return res.status(200).json({success: true, data: provider})
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}

// @des      Create Provider
// @route    POST /api/providers/
// @access   Public

const createProvider = async (req,res) => {
  try {
    const provider = await Provider.create(req.body);
    console.log('POST' + provider)
    return res.status(200).json({success: true, data: provider})
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}

// @des      Delete Provider by ID
// @route    DELETE /api/providers/:id
// @access   Public

const deleteProvider = async (req,res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      throw new SyntaxError('Cannot find data');
    }
    console.log('DELETE' + provider);
    provider.remove();
    return res.status(200).json({success: true, data: {} })
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({success: false, msg: e.message})
  }
}
module.exports = {
  getProviders,
  getProvider,
  createProvider,
  deleteProvider,
};
