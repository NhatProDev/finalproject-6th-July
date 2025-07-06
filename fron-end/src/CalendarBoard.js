import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Paper
} from '@mui/material';
import AddEventForm from './EventForm';
import './style/CalendarBoard.css';

function CalendarBoard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const calendarId = localStorage.getItem('calendarId');
  const token = localStorage.getItem('token');

  const fetchNotes = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8003/api/calendar/${calendarId}/notes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mappedEvents = res.data.map((note) => ({
        id: note._id,
        title: note.title,
        date: new Date(note.assignedDate).toISOString().split('T')[0],
        description: note.content || '',
        location: note.location || '',
        attendees: note.attendees || '',
        reminder: note.reminder || 10,
        allDay: note.allDay !== undefined ? note.allDay : true,
        category: note.subject || 'General'
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  useEffect(() => {
    if (calendarId && token) {
      fetchNotes();
    }
  }, [calendarId, token]);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setAddEventOpen(true);
  };

  const handleAddEventClose = () => {
    setAddEventOpen(false);
    setSelectedDate(null);
  };

  const handleAddEventSuccess = () => {
    fetchNotes();
    handleAddEventClose();
  };

  const handleEventClick = async (info) => {
    const noteId = info.event.id;

    try {
      const res = await axios.get(
        `http://localhost:8003/api/calendar/${calendarId}/notes/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const note = res.data;

      setSelectedEvent({
        id: note._id,
        title: note.title,
        description: note.contentBlocks?.map((block) =>
          typeof block.data === 'string' ? block.data : JSON.stringify(block.data)
        ).join('\n') || 'No description',
        date: new Date(note.assignedDate).toISOString().split('T')[0],
        location: note.location || '',
        attendees: note.attendees || '',
        reminder: note.reminder || 10,
        allDay: note.allDay !== undefined ? note.allDay : true,
        subject: note.subject || 'None'  // ✅ Gán đúng tên
      });


      setOpen(true);
    } catch (err) {
      console.error('Failed to load event details:', err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      navigate(`/note/edit/${selectedEvent.id}`);
      handleClose();
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      try {
        await axios.delete(
          `http://localhost:8003/api/notes/${selectedEvent.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
        handleClose();
      } catch (err) {
        console.error('Error deleting note:', err);
      }
    }
  };

  const handleEventDrop = async (info) => {
    const { id } = info.event;
    const newDate = info.event.start;
    const formattedDate = new Date(newDate).toISOString();

    try {
      await axios.patch(
        `http://localhost:8003/api/notes/${id}/changeDate`,
        { assignedDate: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvents((prev) =>
        prev.map((event) =>
          event.id === id ? { ...event, date: formattedDate.split('T')[0] } : event
        )
      );
    } catch (err) {
      console.error('Error updating event date:', err);
      info.revert();
    }
  };

  const handleDuplicateWeek = async () => {
    if (!selectedEvent) return;

    const baseDate = new Date(selectedEvent.date);
    const dayOfWeek = baseDate.getDay();
    const duplicates = [];

    for (let i = 0; i < 7; i++) {
      if (i === dayOfWeek) continue;

      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() - dayOfWeek + i);
      const isoDate = new Date(targetDate).toISOString();

      const newNote = {
        ...selectedEvent,
        date: isoDate
      };

      try {
        const res = await axios.post(
          `http://localhost:8003/api/notes`,
          {
            title: newNote.title,
            assignedDate: isoDate,
            content: newNote.description,
            location: newNote.location,
            attendees: newNote.attendees,
            subject: newNote.category,
            reminder: newNote.reminder,
            allDay: newNote.allDay,
            calendarId: calendarId
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        duplicates.push({ ...newNote, id: res.data.noteId });
      } catch (err) {
        console.error('Error duplicating event:', err);
      }
    }

    fetchNotes();
    handleClose();
  };

  return (
    <Box sx={{ marginLeft: '60px', padding: 2, minHeight: '100vh', backgroundColor: '#fff' }}>
      <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
        Planova
      </Typography>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          editable={true}
          eventDrop={handleEventDrop}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventClassNames={() => 'note-event'}
          displayEventTime={false}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEvent?.title || 'Event Details'}</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom><strong>Date:</strong> {new Date(selectedEvent?.date).toLocaleDateString()}</Typography>
          <Typography gutterBottom><strong>Subject:</strong> {selectedEvent?.subject || 'None'}</Typography>

          <Typography gutterBottom sx={{ mt: 2 }}><strong>Tasks:</strong></Typography>
          {selectedEvent?.description
            .split('\n')
            .map((line, idx) => (
              <Typography key={idx} sx={{ pl: 2, whiteSpace: 'pre-line' }}>
                - {line}
              </Typography>
            ))}

          <Typography gutterBottom sx={{ mt: 2 }}><strong>Location:</strong> {selectedEvent?.location || 'N/A'}</Typography>
          <Typography gutterBottom><strong>Attendees:</strong> {selectedEvent?.attendees || 'None'}</Typography>
          <Typography gutterBottom><strong>Reminder:</strong> {selectedEvent?.reminder} mins</Typography>
          <Typography gutterBottom><strong>All Day:</strong> {selectedEvent?.allDay ? 'Yes' : 'No'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEdit} variant="outlined" color="primary">Edit</Button>
          <Button onClick={handleDelete} variant="outlined" color="error">Delete</Button>
          <Button onClick={handleDuplicateWeek} variant="contained" color="secondary">Duplicate to Week</Button>
          <Button onClick={handleClose} color="inherit">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addEventOpen} onClose={handleAddEventClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent dividers>
          <AddEventForm
            selectedDate={selectedDate}
            calendarId={calendarId}
            onClose={handleAddEventClose}
            onAddSuccess={handleAddEventSuccess}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default CalendarBoard;
