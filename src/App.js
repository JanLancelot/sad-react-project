import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Calendar from "./pages/Calendar";
import NewEvent from "./pages/NewEvent";
import Education from "./pages/Education";
import Accounting from "./pages/Accounting";
import Business from "./pages/Business";
import ArtsAndSciences from "./pages/ArtsAndSciences";
import Maritime from "./pages/Maritime";
import HealthSciences from "./pages/HealthSciences";
import Hospitality from "./pages/Hospitality";
import DepartmentSettings from "./pages/DepartmentSettings";
import AddStudentPage from "./pages/InsertMockData";
import EventDetailsPage from "./pages/EventDetailsPage";
import Reports from "./pages/Reports"
import Signin from "./pages/Signin";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/computer-studies" element={<Students />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/new-event" element={<NewEvent />} />
        <Route path="/education" element={<Education />} />
        <Route path="/accountancy" element={<Accounting />} />
        <Route path="/business-administration" element={<Business />} />
        <Route path="/arts-and-sciences" element={<ArtsAndSciences />} />
        <Route path="/maritime" element={<Maritime />} />
        <Route path="/health-sciences" element={<HealthSciences />} />
        <Route path="/hospitality" element={<Hospitality />} />
        <Route path="/department-settings" element={<DepartmentSettings />} />
        <Route path="/insert" element={<AddStudentPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/" element={<Signin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
