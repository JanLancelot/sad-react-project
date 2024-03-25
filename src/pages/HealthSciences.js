import Layout from "./Layout";
import DepartmentHeader from "./components/DepartmentHeader";
import ActivityList from "./components/ActivityList";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const secondaryNavigation = [
  { name: "Computer Studies", href: "/computer-studies", current: false },
  { name: "Education", href: "/education", current: false },
  { name: "Accountancy", href: "/accountancy", current: false },
  {
    name: "Business Administration",
    href: "/business-administration",
    current: false,
  },
  { name: "Arts and Sciences", href: "/arts-and-sciences", current: false },
  { name: "Maritime", href: "/maritime", current: false },
  { name: "Health Sciences", href: "/health-sciences", current: true },
  {
    name: "Hospitality Management and Tourism",
    href: "/hospitality",
    current: false,
  },
];

const departmentName = "Health Sciences Department";
const deanName = "[Health Sciences Dean]";

export default function HealthSciences() {
  const [students, setStudents] = useState([]);
  const [meetingCount, setMeetingCount] = useState(0);
  const [pCompleteRequirements, setPCompleteRequirements] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      const departmentRef = collection(
        db,
        "students",
        "y1VlAwCIfawwp5tQRueD",
        "health-sciences-department"
      );
      const meetingsRef = query(collection(db, "meetings"), where("department", "==", "Health Sciences Department"));

      // Fetch students and meetings in a single batch
      const [studentSnapshot, meetingSnapshot] = await Promise.all([
        getDocs(departmentRef),
        getDocs(meetingsRef),
      ]);

      const fetchedStudents = studentSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const fetchedMeetings = meetingSnapshot.docs;

      // Calculate students with complete requirements
      const completeRequirementsCount = fetchedStudents.filter(
        (student) => student.requirements === "Complete"
      ).length;
      const pComplete = (completeRequirementsCount / fetchedStudents.length) * 100;

      // Calculate attendance rate
      const totalAttendance = fetchedStudents.reduce(
        (sum, student) => sum + student.eventsAttended,
        0
      );
      const attendanceRate =
        (totalAttendance / (fetchedStudents.length * fetchedMeetings.length)) * 100;

      setStudents(fetchedStudents);
      setMeetingCount(fetchedMeetings.length);
      setPCompleteRequirements(pComplete);
      setAttendanceRate(attendanceRate);
    };

    fetchData();
  }, []);

  const studentCount = students.length;

  let stats = [
    { name: "Total number of students", value: studentCount },
    { name: "Total number of events", value: meetingCount, unit: "" },
    {
      name: "Percentage of students with complete requirements",
      value: `${pCompleteRequirements.toFixed(2)}%`,
    },
    { name: "Attendance rate", value: `${attendanceRate.toFixed(2)}%` },
  ];

  return (
    <Layout>
      <main>
        <header>
          <DepartmentHeader
            stats={stats}
            secondaryNavigation={secondaryNavigation}
            departmentName={departmentName}
            dean={deanName}
          ></DepartmentHeader>
        </header>

        <ActivityList
          students={students}
          meetingCount={meetingCount}
        ></ActivityList>
      </main>
    </Layout>
  );
}
