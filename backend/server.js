const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    cors = require('cors'),
    dotenv = require('dotenv'),
    bodyParser = require('body-parser'),
    connectDb = require('./db_config/config'),
    port = process.env.PORT || 8000;

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', require('./routes/index'));
app.use(require('./middleware/error-handling'));


// MongoDB Connection
connectDb();
app.listen(port, () => {
    console.log("You are connected to db and currently listening to port: " + port);
});

// mongodb.initDb((err) => {
//     if (!err) {
//         app.listen(port)
//         console.log("You are connected to db and currently listening to port: " + port);
//     } else {
//         console.log('Database connection error: ' + err);
//         process.exit(1);
//     }
// });


