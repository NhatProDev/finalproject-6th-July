const express = require('express');
const router = express.Router();
const noteAction = require('../action/noteAction');
const { verifyToken } = require('../middlewares/auth');

// All routes require authentication
router.post('/', verifyToken, noteAction.saveNote);
router.get('/:id', verifyToken, noteAction.getNote);
router.put('/:id', verifyToken, noteAction.updateNote);
router.delete('/:id', verifyToken, noteAction.deleteNote);

// Get all notes for current user
router.get('/', verifyToken, noteAction.getAllNotes);

// Toggle isDone status
router.patch('/:id/toggle', verifyToken, noteAction.toggleIsDone);

router.patch('/:id/changeDate', verifyToken, noteAction.changeNoteDate)
module.exports = router;
