// This will use Moongoose
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MongoDB_URI || "mongodb+srv://johnayomide31:6IL0h2A6ApC1ejpk@cluster0.ykzgmfz.mongodb.net/aaet_menu");
        console.log('Connected to DB', connect.connection.host, connect.connection.name);
    } catch (err) {
        console.log('Error: ' + err);
        process.exit(1);
    }
}

module.exports = connectDb;







// const dotenv = require('dotenv');
// dotenv.config();

// const MongoClient = require('mongodb').MongoClient;

// let database;

// const initDb = (callback) => {
//     if (database) {
//         console.log('Db is already initialised');
//         return callback(null, database);
//     }

//     MongoClient.connect(process.env.MongoDB_URI)
//         .then((client) => {
//             database = client.db();
//             console.log('DB just got connected')
//             callback(null, database);
//         })
//         .catch((err) => {
//             console.log('Error ' + err);
//             callback(err);
//         });
// };

// const getDatabase = () => {
//     if (!database) {
//         throw Error('Db is not initialised');
//     }
//     return database;
// }


// module.exports = {
//     initDb,
//     getDatabase
// };