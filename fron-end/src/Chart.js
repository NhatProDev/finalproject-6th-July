import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Select, MenuItem,
  Checkbox, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions,
  Divider, useMediaQuery, useTheme
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { EventNote, LocationOn, Group, Category, CheckCircle, HighlightOff, BarChart } from '@mui/icons-material';

const Chart = ({ events = [], setEvents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalEvent, setModalEvent] = useState(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAttendees, setEditAttendees] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchEvents = async () => {
      const calendarId = localStorage.getItem('calendarId');
      const token = localStorage.getItem('token');
      if (!calendarId || !token) return;
      try {
        const res = await fetch(`http://localhost:8003/api/calendar/${calendarId}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const mapped = data.map((note) => ({
          _id: note._id,
          title: note.title,
          date: note.assignedDate,
          description: note.content,
          category: note.subject || 'General',
          location: note.location || '',
          attendees: note.attendees || '',
          reminder: note.reminder || 0,
          allDay: note.allDay || false,
          completed: note.completed || false,
        }));
        setEvents(mapped);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };
    fetchEvents();
  }, [setEvents]);

  const toggleCompleted = (index) => {
    const newEvents = [...events];
    newEvents[index].completed = !newEvents[index].completed;
    setEvents(newEvents);
  };

  const openEditDialog = (event) => {
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditDate(event.date);
    setEditDescription(event.description || '');
    setEditLocation(event.location || '');
    setEditAttendees(event.attendees || '');
    setEditCategory(event.category || '');
  };

  const handleSaveEdit = () => {
    const updatedEvents = events.map((e) =>
      e._id === editingEvent._id
        ? {
            ...e,
            title: editTitle,
            date: editDate,
            description: editDescription,
            location: editLocation,
            attendees: editAttendees,
            category: editCategory,
          }
        : e
    );
    setEvents(updatedEvents);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (eventToDelete) => {
    const calendarId = localStorage.getItem('calendarId');
    const token = localStorage.getItem('token');
    if (!calendarId || !token) return;

    try {
      const res = await fetch(`http://localhost:8003/api/calendar/${calendarId}/notes/${eventToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedEvents = events.filter((e) => e._id !== eventToDelete._id);
        setEvents(updatedEvents);
      } else {
        console.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredEvents = events.filter((event) => {
  const hasRequiredFields = event.title && event.date;
  const matchesSearch = (event.title || '').toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = categoryFilter === 'all' || (event.category || '').toLowerCase() === categoryFilter.toLowerCase();
  const notHiddenByCompleted = !hideCompleted || !event.completed;
  return hasRequiredFields && matchesSearch && matchesCategory && notHiddenByCompleted;
});

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = filteredEvents.filter(e => new Date(e.date).toISOString().split('T')[0] === todayStr);
  const otherEvents = filteredEvents.filter(e => new Date(e.date).toISOString().split('T')[0] !== todayStr);

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
  };

  const completedCount = events.filter(e => e.completed).length;
  const notCompletedCount = events.filter(e => !e.completed).length;
  const pieData = [
    { name: 'Completed', value: completedCount },
    { name: 'Not Completed', value: notCompletedCount },
  ];
  const pieColors = ['#1976d2', '#e53935'];

  const renderEventRow = (event, index) => (
    <Paper key={index} sx={{
      p: 2, mb: 2,
      backgroundColor: event.completed ? '#e3f2fd' : '#fff',
      borderRadius: 2,
      boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
      borderLeft: `5px solid ${event.completed ? '#1976d2' : '#e53935'}`
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={1}>
          <Checkbox checked={event.completed} onChange={() => toggleCompleted(index)} />
        </Grid>
        <Grid item xs={10} sm={3}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventNote fontSize="small" /> {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">{formatDisplayDate(event.date)}</Typography>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Typography variant="body2"><LocationOn fontSize="small" /> {event.location || 'No location'}</Typography>
          <Typography variant="body2"><Group fontSize="small" /> {event.attendees || 'No attendees'}</Typography>
          <Typography variant="body2"><Category fontSize="small" /> {event.category || 'None'}</Typography>
          {event.description && <Typography variant="body2" mt={1}>{event.description}</Typography>}
        </Grid>
        <Grid item xs={12} sm={3} display="flex" gap={1} justifyContent={isMobile ? 'flex-start' : 'flex-end'}>
          <Button startIcon={<CheckCircle />} variant="outlined" color="primary" size="small" onClick={() => setModalEvent(event)}>Detail</Button>
          <Button startIcon={<HighlightOff />} variant="outlined" color="error" size="small" onClick={() => handleDeleteEvent(event)}>Delete</Button>
          <Button variant="outlined" size="small" onClick={() => openEditDialog(event)}>Edit</Button>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box
  sx={{
    pl: '80px',      // đẩy nội dung qua phải tránh đè vào sidebar
    pr: 2,
    pt: 3,
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  }}
>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, color: '#1976d2', fontWeight: 700 }}>
        <BarChart sx={{ mr: 1 }} /> Chart View
      </Typography>

      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} sm={4}>
          <Select fullWidth value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="all">📂 All categories</MenuItem>
            <MenuItem value="work">💼 Work</MenuItem>
            <MenuItem value="personal">🏡 Personal</MenuItem>
            <MenuItem value="meeting">🗕️ Meeting</MenuItem>
            <MenuItem value="birthday">🎉 Birthday</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth placeholder="🔍 Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button variant="contained" color="primary" fullWidth onClick={() => setHideCompleted(!hideCompleted)}>
            {hideCompleted ? '👁 Show Completed' : '🙈 Hide Completed'}
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center', mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>📈 Completion Ratio</Typography>
        <PieChart width={350} height={300}>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Box>

      <Divider textAlign="left" sx={{ mb: 2 }}>🔴 Today's Events</Divider>
      {todayEvents.map((event) => renderEventRow(event, events.indexOf(event)))}

      <Divider textAlign="left" sx={{ mt: 4, mb: 2 }}>🗓️ Other Events</Divider>
      {otherEvents.map((event) => renderEventRow(event, events.indexOf(event)))}

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onClose={() => setEditingEvent(null)} fullWidth maxWidth="sm">
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, maxHeight: '400px', overflowY: 'auto' }}>
          <TextField label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Date" type="datetime-local" value={editDate} onChange={(e) => setEditDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} fullWidth multiline InputLabelProps={{ shrink: true }} />
          <TextField label="Location" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Attendees" value={editAttendees} onChange={(e) => setEditAttendees(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <Select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} fullWidth displayEmpty>
            <MenuItem value="work">💼 Work</MenuItem>
            <MenuItem value="personal">🏡 Personal</MenuItem>
            <MenuItem value="meeting">🗕️ Meeting</MenuItem>
            <MenuItem value="birthday">🎉 Birthday</MenuItem>
            <MenuItem value="other">📋 Other</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingEvent(null)} color="error">Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={!!modalEvent} onClose={() => setModalEvent(null)}>
        <DialogTitle>{modalEvent?.title}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom><strong>Date:</strong> {formatDisplayDate(modalEvent?.date)}</Typography>
          <Typography gutterBottom><strong>Description:</strong> {modalEvent?.description || 'No description'}</Typography>
          <Typography gutterBottom><strong>Location:</strong> {modalEvent?.location || 'No location'}</Typography>
          <Typography gutterBottom><strong>Attendees:</strong> {modalEvent?.attendees || 'None'}</Typography>
          <Typography gutterBottom><strong>Category:</strong> {modalEvent?.category || 'None'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEvent(null)} variant="contained" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chart;
