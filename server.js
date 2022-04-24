const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path:'./config/config.env'});


//Connect to database
connectDB();

//Route files
// const cars = require('./routes/cars');
// const providers = require('./routes/providers');
const users = require('./routes/users');
// const bookings = require('./routes/bookings');
const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Mount routers
// app.use('/api/cars', cars);
// app.use('/api/providers', providers);
app.use('/api/users', users);
// app.use('/api/bookings', bookings);
const PORT=process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ',process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandles promise rejections
process.on('unhandledRejection', (err,promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
});