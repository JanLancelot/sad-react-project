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
import ViewEvalForm from "./pages/ViewEvalForm";
import Register from "./pages/Register";
import SignupStudent from "./pages/SignupStudent";
import EvaluationFormManager from "./pages/EvaluationFormManager";
import EditStudentPage from "./pages/EditStudentPage";
import EvaluationStandardsView from "./pages/EvaluationStandardsView";
import EvaluationStandardsEdit from "./pages/EvaluationStandardsEdit";
import UserManagement from "./pages/UserManagement";
import StudentMasterlist from "./pages/StudentMasterList";
import Events from "./pages/Events";
import EventDetails from './pages/EventDetails';
import ForgotPassword  from './pages/ForgotPassword';
import RegisteredUsers from "./pages/RegisteredUsers";
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
    path: "/register",
    element: <Register />,
  },
  {
    path: "/signup-student",
    element: <SignupStudent />,
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
    path: "/evaluation-form-manager",
    element: <Protected><EvaluationFormManager /></Protected>,
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
  {
    path: "/events/:eventId/attendees/evalform/:evalId",
    element: <Protected><ViewEvalForm /></Protected>
  },
  {
    path: "/edit-student/:id",
    element: <Protected><EditStudentPage /></Protected>
  },
  {
    path: "/evaluations-view",
    element: <Protected><EvaluationStandardsView /></Protected>
  },
  {
    path: "/evaluation-standards/edit/:standardId",
    element: <Protected><EvaluationStandardsEdit /></Protected>
  },
  {
    path: "/user-management",
    element: <Protected><UserManagement /></Protected>
  },
  {
    path: "/student-masterlist",
    element: <Protected><StudentMasterlist /></Protected>
  },
  {
    path: "/events",
    element: <Protected><Events /></Protected>
  },
  {
    path: "/event/:eventId",
    element: <Protected><EventDetails /></Protected>
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword/>
  },
  {
    path: "/registered-users",
    element: <Protected><RegisteredUsers/></Protected>
  }
]);

function App() {
  return (
    <AuthContext>
      <RouterProvider router={router} />
    </AuthContext>
  );
}

export default App;