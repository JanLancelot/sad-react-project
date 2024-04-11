import { createBrowserRouter, RouterProvider, Link, Navigate } from "react-router-dom";
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
import EventAttendees from "./pages/EventAttendees";
import StudentEventPage from "./pages/components/StudentEventPage"
import { ProtectedRoute } from "./pages/components/ProtectedRoute";
import { Protected } from "./pages/components/Protected";
import { AuthContext } from "./pages/components/AuthContext";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Signin />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/computer-studies",
    element: <Protected><Students /></Protected>,
  },
  {
    path: "/calendar",
    element: <Protected><Calendar /></Protected>,
  },
  {
    path: "/new-event",
    element: <Protected><NewEvent /></Protected>,
  },
  {
    path: "/education",
    element: <Protected><Education /></Protected>,
  },
  {
    path: "/accountancy",
    element: <Protected><Accounting /></Protected>,
  },
  {
    path: "/business-administration",
    element: <Protected><Business /></Protected>,
  },
  {
    path: "/arts-and-sciences",
    element: <Protected><ArtsAndSciences /></Protected>,
  },
  {
    path: "/maritime",
    element: <Protected><Maritime /></Protected>,
  },
  {
    path: "/health-sciences",
    element: <Protected><HealthSciences /></Protected>,
  },
  {
    path: "/hospitality",
    element: <Protected><Hospitality /></Protected>,
  },
  {
    path: "/department-settings",
    element: <Protected><DepartmentSettings /></Protected>,
  },
  {
    path: "/insert",
    element: <Protected><AddStudentPage /></Protected>,
  },
  {
    path: "/events/:eventId/edit",
    element: <Protected><EventDetailsPage /></Protected>,
  },
  {
    path: "/events/:eventId/attendees",
    element: <Protected><EventAttendees /></Protected>,
  },
  {
    path: "/reports",
    element: <Protected><Reports /></Protected>,
  },
  {
    path: "/student/:id",
    element: <Protected><StudentEventPage /></Protected>,
  },
]);

function App() {
  return (
    <AuthContext>
      <RouterProvider router={router} />
    </AuthContext>
  );
}

export default App;