import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import CalendarBoard from './CalendarBoard';
import AddEvent from './AddEvent';
import Profile from './Profile';
import Login from './Login';
import Register from './Register';
import Chart from './Chart';
import AddEventForm from './EventForm';
import './style/App.css';

function AppWrapper() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app">
      {!isLoginPage && <Sidebar />}
      <div className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/calendar" element={<CalendarBoard />} />
          <Route path="/add-event" element={<AddEvent />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/form" element={<AddEventForm />} />
        </Routes>
      </div>
    </div>
  );
}

// 🧠 Bọc bằng Router bên ngoài
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
