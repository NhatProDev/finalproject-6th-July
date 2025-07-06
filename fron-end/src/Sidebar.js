import React, { useState } from 'react';
import {
  FaUser, FaSearch, FaUsers, FaBell,
  FaChartPie, FaStickyNote, FaCube,
  FaCalendarAlt, FaCog, FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Paper, Typography, Divider,
  Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Button,
  Menu, MenuItem, ListItemIcon
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PolicyIcon from '@mui/icons-material/Policy';
import Logout from '@mui/icons-material/Logout';

function Sidebar() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openUserMenu = Boolean(anchorEl);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedIconIndex, setSelectedIconIndex] = useState(null);

  const icons = [
    {
      icon: FaUser,
      action: (e) => setAnchorEl(e.currentTarget) // 👈 mở popup user
    },
    {
      icon: FaSearch,
      action: () => setShowSearch(!showSearch)
    },
    { icon: FaUsers },
    { icon: FaBell,
      action: () => setShowNotifications(!showNotifications) 
     },
    { icon: FaChartPie, route: '/chart' },
    { icon: FaStickyNote },
    { icon: FaCube },
    { icon: FaCalendarAlt, route: '/calendar' },
    { icon: FaCog }
  ];

  const dummyData = [
    { id: 1, name: 'Note 1 - Meeting notes' },
    { id: 2, name: 'Note 2 - Project plan' },
    { id: 3, name: 'Note 3 - Todo list' },
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    const filtered = dummyData.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setResults(filtered);
  };

  const handleLogout = () => {
    setOpenLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setOpenLogoutConfirm(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setOpenLogoutConfirm(false);
  };

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar cố định */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '60px',
            height: '100vh',
            bgcolor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 2,
            pb: 2,
            boxShadow: 2,
            zIndex: 1000,
          }}
        >
          {/* Các icon điều hướng */}
          <Box>
            {icons.map(({ icon: Icon, route, action }, index) => (
              <Box
                key={index}
                onClick={(e) => {
                  setSelectedIconIndex(index);
                  setShowSearch(false);
                  setShowNotifications(false);
                  setAnchorEl(null);
                  if (action) action(e);
                  if (route) navigate(route);
                }}
                sx={{
                    my: 1.5,
                    fontSize: 24,
                    cursor: 'pointer',
                    color: '#333',
                    backgroundColor: selectedIconIndex === index ? '#e0e0e0' : 'transparent', // 👈 nền xám nhạt
                    borderRadius: 2,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderLeft: selectedIconIndex === index ? '4px solid #1976d2' : '4px solid transparent', // 👈 viền trái xanh
                '&:hover': {
                    color: '#1976d2',
                  }
            }}
              >
                <Icon />
              </Box>
            ))}
          </Box>

          {/* Icon Logout */}
          <Box
            onClick={handleLogout}
            sx={{
              fontSize: 24,
              cursor: 'pointer',
              color: '#e53935',
              mb: 3,
              '&:hover': {
                color: '#c62828'
              }
            }}
          >
            <FaSignOutAlt />
          </Box>
        </Box>

        {/* Form search hiện bên phải sidebar */}
        {showSearch && (
          <Paper elevation={3} sx={{ p: 2, width: 300, ml: '70px', mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Search Notes
            </Typography>
            <TextField
              label="Search..."
              fullWidth
              value={query}
              onChange={handleSearch}
              variant="outlined"
              size="small"
            />
            <Divider sx={{ my: 2 }} />
            {results.length > 0 ? (
              results.map((item) => (
                <Box key={item.id} sx={{ mb: 1 }}>
                  <Typography variant="body2">{item.name}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No results found.
              </Typography>
            )}
          </Paper>
        )}

        {showNotifications && (
          <Paper elevation={3} sx={{ p: 2, width: 300, ml: '70px', mt: 2}}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
           <Divider sx={{ mb: 1 }} />
  </Paper>
)} 
      </Box>

      {/* Popup user menu */}
      <Menu
        anchorEl={anchorEl}
        open={openUserMenu}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.2))',
            width: 230,
            borderRadius: 2
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">Adolf</Typography>
          <Typography variant="body2" color="text.secondary">Adolf@gmail.com</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
          Settings & Preferences
        </MenuItem>
        <MenuItem>
          <ListItemIcon><FeedbackIcon fontSize="small" /></ListItemIcon>
          Give Feedback
        </MenuItem>
        <MenuItem>
          <ListItemIcon><PolicyIcon fontSize="small" /></ListItemIcon>
          Term and Policy
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout fontSize="small" sx={{ color: 'red' }} /></ListItemIcon>
          <Typography color="error">Log out</Typography>
        </MenuItem>
      </Menu>

      {/* Xác nhận logout */}
      <Dialog open={openLogoutConfirm} onClose={cancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Do you want to Log Out?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout}>No</Button>
          <Button onClick={confirmLogout} color="error">Log Out</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Sidebar;
