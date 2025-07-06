const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'code', 'page'],
        required: true
    },
    data: mongoose.Schema.Types.Mixed, // tùy theo type
}, { _id: false });

const noteSchema = new mongoose.Schema({
    title: { type: String },
    contentBlocks: [contentBlockSchema],
    subject: { type: String },
    assignedDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    isDone: { type: Boolean, default: false }, // 👈 Thêm dòng này
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    calendarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar', required: true },
});

noteSchema.virtual('assignedDay').get(function () {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[new Date(this.assignedDate).getDay()];
});

module.exports = mongoose.model('Note', noteSchema);
