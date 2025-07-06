const express = require('express');
const mongoDB = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const router = express.Router();
const requestIp = require('request-ip');
const global = require('./global');
const connectDB = require('./database');
require('dotenv').config();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

// Routes
const mapRoutes = require('./routes/mapRoutes');
const userRoutes = require('./routes/userRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const noteRoutes = require('./routes/noteRoutes');
//Schema
const User = require('./schema/userSchema');
const Note = require('./schema/noteSchema');

//Functionality
const userAction = require('./action/user/userAction');
const noteAction = require('./action/noteAction');

const app = express();
app.use(cors());
app.use(requestIp.mw());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('hello')
})

// Routes use
app.use('/api/maps', mapRoutes);
app.use('/api/calendar', calendarRoutes);

//userAction file:
app.use('/api/users', userRoutes);

//noteAction Routes
app.use('/api/notes', noteRoutes);


const testRoutes = require('./routes/test/testMiddleWareJWT');
app.use('/api', testRoutes);


//init server & port
const PORT = global.binding_PORT || 8003;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Server failed to start due to DB connection error.');
    });

