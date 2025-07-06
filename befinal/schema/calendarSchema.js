const mongoose = require('mongoose');
const noteSchema = require('./noteSchema');

const calendarSchema = new mongoose.Schema({
    title: {type: String},
    description: {type: String},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
})

module.exports = mongoose.model('Calendar', calendarSchema);