import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const statuses = {
  Complete: "text-green-400 bg-green-400/10",
  Incomplete: "text-rose-400 bg-rose-400/10",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function StudentTableBody({ students, meetingCount, department }) {
  const [departmentSettings, setDepartmentSettings] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch students
      const usersRef = collection(db, "users");
      const ccsDepartmentQuery = query(usersRef, where("department", "==", department));
      const usersSnapshot = await getDocs(ccsDepartmentQuery);
      const fetchedStudents = usersSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

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
  }, [db, department]);

  return (
    <tbody>
      {students.map((student) => (
        <tr key={student.id}>
          <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
            <div className="flex items-center gap-x-4">
              <div className="h-8 w-8 rounded-full bg-gray-800"></div>
              <div className="truncate text-sm font-medium leading-6 text-gray-900">
                {student.fullName}
              </div>
            </div>
          </td>
          <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
            <div className="flex gap-x-3">
              <div className="font-mono text-sm leading-6 text-gray-600">
                {student.studentNumber}
              </div>
            </div>
          </td>
          <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
            <div className="flex items-center justify-end gap-x-2 sm:justify-start">
              <div
                className={classNames(
                  student.eventsAttended?.length >= (departmentSettings?.requiredEvents || 0)
                    ? statuses.Complete
                    : statuses.Incomplete,
                  "flex-none rounded-full p-1"
                )}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
              </div>
              <div className="hidden text-gray-900 sm:block">
                {student.eventsAttended?.length >= (departmentSettings?.requiredEvents || 0)
                  ? "Complete"
                  : "Incomplete"}
              </div>
            </div>
          </td>
          <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-600 md:table-cell lg:pr-20">
            {student.eventsAttended?.length || 0}
          </td>
          <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-600 sm:table-cell sm:pr-6 lg:pr-8">
            {meetingCount === 0 ? "N/A" : ((student.eventsAttended.length / meetingCount) * 100).toFixed(2) + "%"}
          </td>
        </tr>
      ))}
    </tbody>
  );
}