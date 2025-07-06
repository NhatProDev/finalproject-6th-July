import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, TextField, Typography,
  MenuItem, Select, InputLabel, FormControl, IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

function AddEvent() {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    assignedDate: null,
    contentBlocks: [],
  });

  const [newBlock, setNewBlock] = useState({ type: 'text', data: '' });

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
        userId: '64xxxxxxxxxxxxxxxxxxxxxx',    
        calendarId: '65yyyyyyyyyyyyyyyyyyyy',  
      };

      const response = await axios.post('http://localhost:8003/api/notes', payload);
      console.log('Note created:', response.data);
      alert('Note created successfully!');
    } catch (err) {
      console.error('Error creating note:', err);
      alert('Failed to create note.');
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5">New Note</Typography>

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

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Add Task</Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Task Type</InputLabel>
              <Select
                value={newBlock.type}
                label="Block Type"
                onChange={(e) => setNewBlock({ ...newBlock, type: e.target.value })}
              >
                <MenuItem value="text">Work</MenuItem>
                <MenuItem value="code">Meeting</MenuItem>
                <MenuItem value="page">Personal</MenuItem>
                <MenuItem value="page">Birthday</MenuItem>
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

            <Button onClick={handleAddBlock} sx={{ mt: 1 }} variant="outlined">
              Add Task
            </Button>
          </Box>

          {/* List of blocks */}
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
              <Typography variant="subtitle2" sx={{ color: 'gray' }}>
                [{block.type.toUpperCase()}]
              </Typography>

              {block.type === 'code' ? (
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: '#272822',
                    color: '#fff',
                    padding: 2,
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    mt: 1,
                  }}
                >
                  {block.data}
                </Box>
              ) : (
                <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                  {block.data}
                </Typography>
              )}

              <IconButton
                onClick={() => handleRemoveBlock(idx)}
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 4 }}
          >
            Save Note
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AddEvent;
