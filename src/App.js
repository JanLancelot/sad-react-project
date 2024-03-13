import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Calendar from './pages/Calendar';
import Layout from './pages/Layout';
import NewEvent from './pages/NewEvent';
import Education from './pages/Education';
import Accounting from './pages/Accounting';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/computer-studies" element={<Students />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/new-event" element={<NewEvent />} />
        <Route path="/education" element={<Education />} />
        <Route path="/accountancy" element={<Accounting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
