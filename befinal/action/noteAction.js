const Note = require('../schema/noteSchema');
const { encrypt, decrypt } = require('../security/crypto');

// 🔹 Save new note
const saveNote = async (req, res) => {
    try {
        const { title, subject, contentBlocks, assignedDate, calendarId } = req.body;
        const userId = req.user.id || req.user._id;

        const encryptedBlocks = contentBlocks.map(block => ({
            type: block.type,
            data: encrypt(JSON.stringify(block.data))
        }));

        const newNote = new Note({
            title: title ? encrypt(title) : '',
            subject: subject ? encrypt(subject) : '',
            contentBlocks: encryptedBlocks,
            assignedDate,
            userId,
            calendarId
        });

        await newNote.save();
        res.status(201).json({ message: 'Note saved successfully', noteId: newNote._id });
    } catch (err) {
        console.error('Error saving note:', err);
        res.status(500).json({ error: 'Failed to save note' });
    }
};

// 🔹 Get one note
const getNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const userId = req.user.id || req.user._id;
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const decryptedBlocks = note.contentBlocks.map(block => ({
            type: block.type,
            data: JSON.parse(decrypt(block.data))
        }));

        res.json({
            _id: note._id,
            title: decrypt(note.title),
            subject: decrypt(note.subject),
            assignedDate: note.assignedDate,
            isDone: note.isDone,
            calendarId: note.calendarId,
            contentBlocks: decryptedBlocks
        });
    } catch (err) {
        console.error('Error getting note:', err);
        res.status(500).json({ error: 'Failed to retrieve note' });
    }
};

// 🔹 Update note
const updateNote = async (req, res) => {
    try {
        const { title, subject, contentBlocks, assignedDate } = req.body;
        const { id } = req.params;

        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const userId = req.user.id || req.user._id;
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (title !== undefined) {
            note.title = title ? encrypt(title) : '';
        }

        if (subject !== undefined) {
            note.subject = subject ? encrypt(subject) : '';
        }

        if (contentBlocks !== undefined) {
            note.contentBlocks = contentBlocks.map(block => ({
                type: block.type,
                data: encrypt(JSON.stringify(block.data))
            }));
        }

        if (assignedDate !== undefined) {
            note.assignedDate = assignedDate;
        }

        note.updatedAt = new Date();

        await note.save();

        res.json({ message: 'Note updated successfully' });
    } catch (err) {
        console.error('Error updating note:', err);
        res.status(500).json({ error: 'Failed to update note' });
    }
};


// 🔹 Delete note
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const userId = req.user.id || req.user._id;
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await note.deleteOne();
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};

// 🔹 Get all notes of logged-in user
const getAllNotes = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const notes = await Note.find({ userId });

        const result = notes.map(note => ({
            _id: note._id,
            title: decrypt(note.title),
            subject: decrypt(note.subject),
            assignedDate: note.assignedDate,
            calendarId: note.calendarId,
            isDone: note.isDone
        }));

        res.json(result);
    } catch (err) {
        console.error('Error getting notes:', err);
        res.status(500).json({ error: 'Failed to retrieve notes' });
    }
};

// Toggle is Done is tracking done or undone tasks
const toggleIsDone = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const userId = req.user.id || req.user._id;
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        note.isDone = !note.isDone;
        await note.save();

        res.json({ message: 'Note status updated', isDone: note.isDone });
    } catch (err) {
        console.error('Error toggling isDone:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

const changeNoteDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedDate } = req.body;

        if (!assignedDate) {
            return res.status(400).json({ error: 'Missing assignedDate' });
        }

        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        note.assignedDate = new Date(assignedDate);
        note.updatedAt = new Date();
        await note.save();

        res.status(200).json({
            message: 'Note date updated successfully',
            assignedDate: note.assignedDate
        });
    } catch (err) {
        console.error('Error updating note date:', err);
        res.status(500).json({ error: 'Failed to update note date' });
    }
};



module.exports = {
    saveNote,
    getNote,
    updateNote,
    deleteNote,
    getAllNotes,
    toggleIsDone,
    changeNoteDate
};
