const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: [true, 'Please add an adress'],
  },
  tel: {
    type: String,
    length: 10,
    required: true
  },

}
,{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}})

// Reverse populate with virtuals
ProviderSchema.virtual('Cars', {
  ref: 'Car',
  localField: '_id',
  foreignField: 'provider',
  justOne: false
});

// Cascade delete
ProviderSchema.pre('remove', async function(next){
  console.log(`Car being removed from provider ${this._id}`);
  await this.model('Car').deleteMany({provider: this._id});
  next();
});
module.exports = mongoose.model('Provider', ProviderSchema);