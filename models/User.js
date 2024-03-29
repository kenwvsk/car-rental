const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,'Please add a name.']
    },
    tel:{
        type: String,
        required:[true, 'Please add telephone number.'],
        unique: true,
        match: [
            /^0\d{9}$/, 'Please add valid tel.'
        ]
    },
    email:{
        type: String,
        required:[true, 'Please add an email.'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 
            'Please add a valid email.'
        ]
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password:{
        type: String,
        required:[true, 'Please add a password.'],
        minlenght: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: String,
    createdAt:{
        type: Date,
        default: Date.now
    }    
});

//Encrypt password using bcrypt
UserSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
};

//Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

// Cascade delete
UserSchema.pre('remove', async function(next){
    console.log(`Booking being removed from user ${this._id}`);
    await this.model('Booking').deleteMany({user: this._id});
    next();
  });

module.exports = mongoose.model('User', UserSchema);