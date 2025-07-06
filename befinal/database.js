require('dotenv').config();
const mongoose = require('mongoose');
const myGlobal = require('./global'); // Adjust the path as necessary

// Retrieve configuration variables
const dbUser = myGlobal.db_config.user;
const dbPassword = myGlobal.db_config.password;
const dbCluster = myGlobal.db_config.cluster;
const dbOption = myGlobal.db_config.option;

// Construct the connection string
const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@${dbCluster}.3phd0.mongodb.net/?${dbOption}`;

const connectDB = async () => {
    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB successfully!");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
};

module.exports = connectDB;
