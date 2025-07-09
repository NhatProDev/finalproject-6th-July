import React, { useEffect, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Paper, IconButton, Menu, MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import AddEventForm from './EventForm';

function CalendarBoard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const calendarId = localStorage.getItem('calendarId');
  const token = localStorage.getItem('token');

  const isMenuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event) => setMenuAnchorEl(event.currentTarget);
  const handleMenuClose = () => setMenuAnchorEl(null);

  const fetchNotes = useCallback(async () => {
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
  }, [calendarId, token]);

  useEffect(() => {
    if (calendarId && token) fetchNotes();
  }, [calendarId, token, fetchNotes]);

  const handleDateClick = (arg) => {
    setSelectedDate(new Date(arg.dateStr));
    setAddEventOpen(true);
    setEditMode(false);
    setEventToEdit(null);
  };

  const handleAddEventClose = () => {
    setAddEventOpen(false);
    setSelectedDate(null);
    setEventToEdit(null);
    setEditMode(false);
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
        subject: note.subject || 'None',
        contentBlocks: note.contentBlocks || []
      });

      setOpen(true);
    } catch (err) {
      console.error('Failed to load event details:', err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      setEditMode(true);
      setEventToEdit(selectedEvent);
      setAddEventOpen(true);
      setOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

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
  };

  const handleRepeatDays = async (interval) => {
    if (!selectedEvent) return;

    try {
      await axios.post(
        `http://localhost:8003/api/notes/${selectedEvent.id}/repeat`,
        { repeatInterval: interval },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotes();
      handleClose();
    } catch (err) {
      console.error('Error repeating event:', err);
    }
  };

  const handleDuplicateWeek = async () => {
    if (!selectedEvent) return;

    const baseDate = new Date(selectedEvent.date);
    const dayOfWeek = baseDate.getDay();

    for (let i = 0; i < 7; i++) {
      if (i === dayOfWeek) continue;

      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() - dayOfWeek + i);
      const isoDate = targetDate.toISOString();

      try {
        await axios.post(
          `http://localhost:8003/api/notes`,
          {
            title: selectedEvent.title,
            assignedDate: isoDate,
            contentBlocks: selectedEvent.contentBlocks,
            location: selectedEvent.location,
            attendees: selectedEvent.attendees,
            subject: selectedEvent.subject,
            reminder: selectedEvent.reminder,
            allDay: selectedEvent.allDay,
            calendarId: calendarId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Error duplicating event:', err);
      }
    }

    fetchNotes();
    handleClose();
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

      {/* Dialog xem chi tiết */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedEvent?.title || 'Event Details'}
          <Box>
            <IconButton onClick={handleMenuOpen}><MoreVertIcon /></IconButton>
            <IconButton onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
            <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}>
              <MenuItem onClick={() => { handleEdit(); handleMenuClose(); }}>Edit</MenuItem>
              <MenuItem onClick={() => { handleDelete(); handleMenuClose(); }}>Delete</MenuItem>
              <MenuItem onClick={() => { handleDuplicateWeek(); handleMenuClose(); }}>Duplicate to Week</MenuItem>
              <MenuItem disabled sx={{ fontWeight: 'bold', opacity: 1 }}>Repeat every:</MenuItem>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <MenuItem key={day} onClick={() => { handleRepeatDays(day); handleMenuClose(); }}>
                  {day} day{day > 1 ? 's' : ''}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom><strong>Date:</strong> {new Date(selectedEvent?.date).toLocaleDateString()}</Typography>
          <Typography gutterBottom><strong>Subject:</strong> {selectedEvent?.subject || 'None'}</Typography>
          <Typography gutterBottom sx={{ mt: 2 }}><strong>Location:</strong> {selectedEvent?.location || 'N/A'}</Typography>
          <Typography gutterBottom><strong>Attendees:</strong> {selectedEvent?.attendees || 'None'}</Typography>
          <Typography gutterBottom><strong>Reminder:</strong> {selectedEvent?.reminder} mins</Typography>
          <Typography gutterBottom><strong>All Day:</strong> {selectedEvent?.allDay ? 'Yes' : 'No'}</Typography>
          <Typography gutterBottom sx={{ mt: 2 }}><strong>Tasks:</strong></Typography>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selectedEvent?.description?.split('\n').map((line, idx) => (
              <Box key={idx} sx={{
                backgroundColor: '#f5f5f5',
                borderLeft: '4px solid #1976d2',
                borderRadius: 1,
                padding: '8px 12px',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                fontSize: 14,
                whiteSpace: 'pre-wrap'
              }}>
                {line}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog thêm/sửa sự kiện */}
      <Dialog open={addEventOpen} onClose={handleAddEventClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent dividers>
          <AddEventForm
            selectedDate={selectedDate}
            calendarId={calendarId}
            onClose={handleAddEventClose}
            onAddSuccess={handleAddEventSuccess}
            initialData={eventToEdit} // thêm dòng này để truyền dữ liệu edit
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default CalendarBoard;