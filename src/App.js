import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Calendar from './pages/Calendar';
import Layout from './pages/Layout';
import NewEvent from './pages/NewEvent';

import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/new-event" element={<NewEvent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
