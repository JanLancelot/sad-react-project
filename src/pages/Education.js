import Layout from "./Layout";
import DepartmentHeader from "./components/DepartmentHeader";
import StudentTableBody from "./components/StudentTableBody";
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const secondaryNavigation = [
  { name: "Computer Studies", href: "/computer-studies", current: false },
  { name: "Education", href: "/education", current: true },
  { name: "Accountancy", href: "/accountancy", current: false },
  { name: "Business Administration", href: "/business-administration", current: false },
  { name: "Arts and Sciences", href: "/arts-and-sciences", current: false },
  { name: "Maritime", href: "/maritime", current: false },
  { name: "Health Sciences", href: "/health-sciences", current: false },
  { name: "Hospitality Management and Tourism", href: "/hospitality", current: false },
];

const departmentName = "Education Department";
const deanName = "Education Department Dean";

export default function Education() {
  const [students, setStudents] = useState([]);
  const [meetingCount, setMeetingCount] = useState(0);
  const [departmentSettings, setDepartmentSettings] = useState(null);

  const department = "Education Department";

  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      const usersRef = collection(db, "users");
      const educationDepartmentQuery = query(usersRef, where("department", "==", "Education Department"));
      const usersSnapshot = await getDocs(educationDepartmentQuery);
      const fetchedStudents = usersSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setStudents(fetchedStudents);

      const meetingsRef = query(collection(db, "meetings"), where("department", "==", "Education Department"));
      const meetingSnapshot = await getDocs(meetingsRef);
      setMeetingCount(meetingSnapshot.docs.length);

      // Fetch department settings
      const departmentSettingsRef = collection(db, "department-settings");
      const departmentSettingsQuery = query(
        departmentSettingsRef,
        where("department", "==", department)
      );
      const departmentSettingsSnapshot = await getDocs(departmentSettingsQuery);
      if (!departmentSettingsSnapshot.empty) {
        const departmentSettingsData = departmentSettingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDepartmentSettings(departmentSettingsData[0]);
      } else {
        setDepartmentSettings(null);
      }
    };

    fetchData();
  }, []);

  const studentCount = students.length;

  const pCompleteRequirements = useMemo(() => {
    const completeRequirementsCount = students.filter(
      (student) =>
        student.eventsAttended?.length >=
        (departmentSettings?.requiredEvents || 0)
    ).length;
    return (completeRequirementsCount / studentCount) * 100;
  }, [students, departmentSettings]);

  const attendanceRate = useMemo(() => {
    const totalAttendance = students.reduce((sum, student) => sum + student.eventsAttended?.length || 0, 0);
    return (totalAttendance / (studentCount * meetingCount)) * 100;
  }, [students, meetingCount]);

  const stats = useMemo(
    () => [
      { name: "Total number of students", value: studentCount },
      { name: "Total number of events", value: meetingCount, unit: "" },
      { name: "Percentage of students with complete requirements", value: `${pCompleteRequirements.toFixed(2)}%` },
      { name: "Attendance rate", value: `${attendanceRate.toFixed(2)}%` },
    ],
    [studentCount, meetingCount, pCompleteRequirements, attendanceRate]
  );

  return (
    <Layout>
      <main>
        <header>
          {/* Secondary navigation */}
          <DepartmentHeader
            stats={stats}
            secondaryNavigation={secondaryNavigation}
            departmentName={departmentName}
            dean={deanName}
          />
        </header>
        <StudentTableBody students={students} meetingCount={meetingCount} department={department} />
      </main>
    </Layout>
  );
}