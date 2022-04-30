const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

//Load env vars
dotenv.config({path:'./config/config.env'});


//Connect to database
connectDB();

//Route files
const cars = require('./routes/cars');
const providers = require('./routes/providers');
const users = require('./routes/users');
const bookings = require('./routes/bookings');
const app = express();

//Body parser
app.use(express.json());

//Sanitize
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
    windowMs: 10*60*1000, //10 min
    max: 5000
});
app.use(limiter);

//Prevent http param pollutions
app.use(hpp());

//Enable cors
app.use(cors())

//Cookie parser
app.use(cookieParser());

//Mount routers
app.use('/api/cars', cars);
app.use('/api/providers', providers);
app.use('/api/users', users);
app.use('/api/bookings', bookings);
const PORT=process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ',process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandles promise rejections
process.on('unhandledRejection', (err,promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
});