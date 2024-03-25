import Layout from "./Layout";
import DepartmentHeader from "./components/DepartmentHeader";
import ActivityList from "./components/ActivityList";
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const secondaryNavigation = [
  { name: "Computer Studies", href: "/computer-studies", current: true },
  { name: "Education", href: "/education", current: false },
  { name: "Accountancy", href: "/accountancy", current: false },
  { name: "Business Administration", href: "/business-administration", current: false },
  { name: "Arts and Sciences", href: "/arts-and-sciences", current: false },
  { name: "Maritime", href: "/maritime", current: false },
  { name: "Health Sciences", href: "/health-sciences", current: false },
  { name: "Hospitality Management and Tourism", href: "/hospitality", current: false },
];

const departmentName = "Computer Studies";
const deanName = "Ann Lim";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [meetingCount, setMeetingCount] = useState(0);

  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      const departmentRef = collection(db, "students", "y1VlAwCIfawwp5tQRueD", "ccs-department");
      const meetingsRef = query(collection(db, "meetings"), where("department", "==", "CS department"));

      const [studentSnapshot, meetingSnapshot] = await Promise.all([getDocs(departmentRef), getDocs(meetingsRef)]);

      const fetchedStudents = studentSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const fetchedMeetings = meetingSnapshot.docs;

      setStudents(fetchedStudents);
      setMeetingCount(fetchedMeetings.length);
    };

    fetchData();
  }, []);

  const studentCount = students.length;

  const pCompleteRequirements = useMemo(() => {
    const completeRequirementsCount = students.filter((student) => student.requirements === "Complete").length;
    return (completeRequirementsCount / studentCount) * 100;
  }, [students]);

  const attendanceRate = useMemo(() => {
    const totalAttendance = students.reduce((sum, student) => sum + student.eventsAttended, 0);
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
        <ActivityList students={students} meetingCount={meetingCount} />
      </main>
    </Layout>
  );
}