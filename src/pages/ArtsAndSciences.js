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
  { name: "Arts and Sciences", href: "/arts-and-sciences", current: true },
  { name: "Maritime", href: "/maritime", current: false },
  { name: "Health Sciences", href: "/health-sciences", current: false },
  {
    name: "Hospitality Management and Tourism",
    href: "/hospitality",
    current: false,
  },
];

const departmentName = "Art and Sciences Department";
const deanName = "[Art and Sciences Dean]";

export default function ArtsAndSciences() {
  const [students, setStudents] = useState([]);
  const [meetingCount, setMeetingCount] = useState(0);
  const [pCompleteRequirements, setPCompleteRequirements] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const db = getFirestore();

  useEffect(() => {
    const departmentRef = collection(
      db,
      "students",
      "y1VlAwCIfawwp5tQRueD",
      "arts-and-sciences-department"
    );

    const fetchData = async () => {
      // Fetch students and meetings
      const [studentSnapshot, meetingSnapshot] = await Promise.all([
        getDocs(departmentRef),
        getDocs(collection(db, "meetings")),
      ]);

      const fetchedStudents = studentSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Calculate students with complete requirements
      const completeRequirementsCount = fetchedStudents.filter(
        (student) => student.requirements === "Complete"
      ).length;
      const pComplete =
        (completeRequirementsCount / fetchedStudents.length) * 100;

      // Calculate attendance rate
      const totalAttendance = fetchedStudents.reduce(
        (sum, student) => sum + student.eventsAttended,
        0
      );
      const attendanceRate =
        (totalAttendance / (fetchedStudents.length * meetingSnapshot.size)) *
        100;

      setStudents(fetchedStudents);
      setMeetingCount(meetingSnapshot.size);
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
