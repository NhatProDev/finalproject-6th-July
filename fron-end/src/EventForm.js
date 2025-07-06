// components/AddEventForm.js
import React, {useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, MenuItem, Select, InputLabel,
  FormControl, IconButton, CardContent
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

function AddEventForm({ selectedDate, calendarId, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    assignedDate: selectedDate || null,
    contentBlocks: [],
  });

  const [newBlock, setNewBlock] = useState({ type: 'text', data: '' });

  useEffect(() => {
  if (selectedDate) {
    setFormData((prev) => ({ ...prev, assignedDate: new Date(selectedDate) }));
  }
}, [selectedDate]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, assignedDate: date });
  };

  const handleBlockChange = (e) => {
    setNewBlock({ ...newBlock, data: e.target.value });
  };

  const handleAddBlock = () => {
    if (newBlock.data.trim() === '') return;
    setFormData({
      ...formData,
      contentBlocks: [...formData.contentBlocks, newBlock],
    });
    setNewBlock({ type: 'text', data: '' });
  };

  const handleRemoveBlock = (index) => {
    const updated = [...formData.contentBlocks];
    updated.splice(index, 1);
    setFormData({ ...formData, contentBlocks: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        calendarId,
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8003/api/notes', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Note created successfully!');
      onAddSuccess(response.data); // callback to update calendar
      onClose(); // close the dialog
    } catch (err) {
      console.error('Error creating note:', err);
      alert('Failed to create note.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent>
        <Typography variant="h6">New Event</Typography>

        <TextField
          fullWidth margin="normal"
          label="Title"
          value={formData.title}
          onChange={handleChange('title')}
        />

        <TextField
          fullWidth margin="normal"
          label="Subject"
          value={formData.subject}
          onChange={handleChange('subject')}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Assigned Date"
            value={formData.assignedDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
        </LocalizationProvider>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Add Task</Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Task Type</InputLabel>
          <Select
            value={newBlock.type}
            onChange={(e) => setNewBlock({ ...newBlock, type: e.target.value })}
            label="Task Type"
          >
            <MenuItem value="text">Work</MenuItem>
            <MenuItem value="code">Meeting</MenuItem>
            <MenuItem value="page">Personal</MenuItem>
            <MenuItem value="birthday">Birthday</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Task"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={newBlock.data}
          onChange={handleBlockChange}
        />

        {formData.contentBlocks.map((block, idx) => (
          <Box
            key={idx}
            sx={{
              mt: 2,
              p: 2,
              borderLeft: '4px solid',
              borderColor:
                block.type === 'text'
                  ? 'primary.main'
                  : block.type === 'code'
                  ? 'secondary.main'
                  : 'success.main',
              backgroundColor: '#f9f9f9',
              borderRadius: 1,
              position: 'relative',
            }}
          >
            <Typography variant="subtitle2">[{block.type.toUpperCase()}]</Typography>
            <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>
              {block.data}
            </Typography>

            <IconButton
              onClick={() => handleRemoveBlock(idx)}
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={handleAddBlock} variant="outlined">
            Add Task
            </Button>
        <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
        >
            Save Event
        </Button>
</Box>
      </CardContent>
    </form>
  );
}

export default AddEventForm;
