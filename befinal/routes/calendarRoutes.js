const express = require('express');
const router = express.Router();
const { calendarSaveNote, getNote, calendarGetNote, calendarGetAllNotes, calendarDeleteNote, calendarGetByUserId } = require('../action/calendarAction');
const {verifyToken} = require('../middlewares/auth');

// Tạo note mới trong calendar
router.post('/:calendarId/notes', verifyToken, calendarSaveNote);

// Lấy note cụ thể trong calendar
router.get('/:calendarId/notes/:noteId', calendarGetNote);

// getAllNotes in calendar
router.get('/:calendarId/notes', calendarGetAllNotes);

// delete note
router.delete('/:calendarId/notes/:noteId', verifyToken, calendarDeleteNote);

router.get('/user/:userId', calendarGetByUserId);

module.exports = router;
