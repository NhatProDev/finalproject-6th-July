const Calendar = require('../schema/calendarSchema');
const Note = require('../schema/noteSchema');
const { encrypt, decrypt } = require('../security/crypto');

// GET 1 note trong calendar
const calendarGetNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.noteId,
            calendarId: req.params.calendarId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        let title = '';
        let subject = '';
        try {
            if (note.title) title = decrypt(note.title);
            if (note.subject) subject = decrypt(note.subject);
        } catch (err) {
            console.warn(`⚠️ Decryption failed for title/subject: ${err.message}`);
        }

        let decryptedBlocks = [];
        if (Array.isArray(note.contentBlocks)) {
            decryptedBlocks = note.contentBlocks.map(block => {
                let data = '';
                try {
                    if (block.data) {
                        data = JSON.parse(decrypt(block.data));
                    }
                } catch (err) {
                    console.warn(`⚠️ Failed to decrypt content block for note ${note._id}: ${err.message}`);
                }

                return {
                    type: block.type,
                    data
                };
            });
        }

        res.status(200).json({
            _id: note._id,
            title,
            subject,
            assignedDate: note.assignedDate,
            assignedDay: note.assignedDay,
            contentBlocks: decryptedBlocks
        });
    } catch (err) {
        console.error('Error in calendarGetNote:', err);
        res.status(500).json({ error: 'Failed to retrieve note' });
    }
};


// 🔹 SAVE note mới trong calendar
const calendarSaveNote = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const calendarId = req.params.calendarId || req.body.calendarId;

        if (!userId || !calendarId) {
            return res.status(400).json({ error: 'Missing UserID or calendarId' });
        }

        const { title, subject, contentBlocks, assignedDate } = req.body;

        const encryptedBlocks = contentBlocks.map(block => ({
            type: block.type,
            data: encrypt(JSON.stringify(block.data))
        }));

        const newNote = new Note({
            userId,
            calendarId,
            title: encrypt(title || ''),
            subject: encrypt(subject || ''),
            assignedDate,
            contentBlocks: encryptedBlocks
        });

        await newNote.save();

        res.status(201).json({
            message: 'Note saved to notes collection',
            noteId: newNote._id,
            calendarId,
            title,
            assignedDate
        });
    } catch (err) {
        console.error('Error in calendarSaveNote:', err);
        res.status(500).json({ error: 'Failed to save note' });
    }
};

// 🔹 GET tất cả note trong calendar
const calendarGetAllNotes = async (req, res) => {
    try {
        const calendarId = req.params.calendarId;

        const calendar = await Calendar.findById(calendarId);
        if (!calendar) {
            return res.status(404).json({ message: "Calendar not found" });
        }

        const notes = await Note.find({ calendarId });

        if (!notes.length) {
            return res.status(404).json({ message: "No notes were found in this calendar" });
        }

        const decryptedNotes = notes.map(note => {
            let title = '';
            let subject = '';
            try {
                if (note.title) title = decrypt(note.title);
                if (note.subject) subject = decrypt(note.subject);
            } catch (err) {
                console.warn(`❗ Decryption failed for note ID ${note._id}:`, err.message);
            }

            return {
                _id: note._id,
                title,
                subject,
                assignedDate: note.assignedDate,
                assignedDay: note.assignedDay
            };
        });


        res.status(200).json(decryptedNotes);
    } catch (err) {
        console.error('Error in calendarGetAllNotes:', err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🔹 DELETE note trong calendar
const calendarDeleteNote = async (req, res) => {
    try {
        const { calendarId, noteId } = req.params;
        const userId = req.user?.id || req.user?._id;

        const note = await Note.findOne({ _id: noteId, calendarId });

        if (!note) {
            return res.status(404).json({ message: "Note not found in this calendar" });
        }

        if (note.userId.toString() !== userId?.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this note" });
        }

        await Note.deleteOne({ _id: noteId });

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (err) {
        console.error("Error in calendarDeleteNote:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🔹 GET calendar theo user
const calendarGetByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        const calendar = await Calendar.findOne({ userId });
        if (!calendar) {
            return res.status(404).json({ message: 'Calendar not found for this user' });
        }

        res.status(200).json({ calendarId: calendar._id });
    } catch (err) {
        console.error('Error in calendarGetByUserId:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    calendarGetNote,
    calendarSaveNote,
    calendarGetAllNotes,
    calendarDeleteNote,
    calendarGetByUserId
};
