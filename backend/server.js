const express = require('express'),
    app = express(),
    cors = require('cors'),
    dotenv = require('dotenv'),
    bodyParser = require('body-parser'),
    connectDb = require('./db_config/config');
const port = process.env.PORT || 8000;

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files with proper MIME types
app.use(express.static('frontend', {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        }
    }
}));

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


