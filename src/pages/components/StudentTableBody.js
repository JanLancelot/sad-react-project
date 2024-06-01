import React, { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import { useReactToPrint } from "react-to-print";

const statuses = {
  Complete: "text-green-400 bg-green-400/10",
  Incomplete: "text-rose-400 bg-rose-400/10",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function StudentTableBody({
  students,
  meetingCount,
  department,
}) {
  const [departmentSettings, setDepartmentSettings] = useState(null);
  const db = getFirestore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [filter, setFilter] = useState("All");

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    const fetchData = async () => {
      const usersRef = collection(db, "users");
      const ccsDepartmentQuery = query(
        usersRef,
        where("department", "==", department)
      );
      const usersSnapshot = await getDocs(ccsDepartmentQuery);
      const fetchedStudents = usersSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const departmentSettingsRef = collection(db, "department-settings");
      const departmentSettingsQuery = query(
        departmentSettingsRef,
        where("department", "==", department)
      );
      const departmentSettingsSnapshot = await getDocs(departmentSettingsQuery);
      if (!departmentSettingsSnapshot.empty) {
        const departmentSettingsData = departmentSettingsSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );
        setDepartmentSettings(departmentSettingsData[0]);
      } else {
        setDepartmentSettings(null);
      }
    };
    fetchData();
  }, [db, department]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredStudents = students.filter((student) => {
    const isComplete = student.eventsAttended?.length >= (departmentSettings?.requiredEvents || 0);
    if (filter === "Complete" && !isComplete) return false;
    if (filter === "Incomplete" && isComplete) return false;
    return student.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleStudentClick = (student) => {
    navigate(`/student/${student.id}`);
  };

  const handleRedirectToSignup = () => {
    navigate("/signup-student");
  };

  return (
    <div className="border-t border-gray-200 pt-11">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          List of Students
        </h2>
        <button
          onClick={handleRedirectToSignup}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Student
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-5 sm:px-6">
        <input
          type="text"
          placeholder="Search by student name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-md px-3 py-2 w-full"
        />
      </div>

      {/* Filter and Print Buttons */}
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <select
          value={filter}
          onChange={handleFilterChange}
          className="border rounded-md px-3 py-2"
        >
          <option value="All">All</option>
          <option value="Complete">Complete</option>
          <option value="Incomplete">Incomplete</option>
        </select>
        <button
          onClick={handlePrint}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Print
        </button>
      </div>

      {/* Table content */}
      <div ref={componentRef}>
        <table className="mt-6 w-full whitespace-nowrap text-left">
          <colgroup>
            <col className="w-full sm:w-4/12" />
            <col className="lg:w-4/12" />
            <col className="lg:w-2/12" />
            <col className="lg:w-1/12" />
            <col className="lg:w-1/12" />
          </colgroup>
          <thead className="border-b border-gray-200 text-sm leading-6 text-gray-900">
            <tr>
              <th
                scope="col"
                className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
              >
                Student name
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
              >
                Student Number
              </th>
              <th
                scope="col"
                className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
              >
                Requirements
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
              >
                Events attended
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
              >
                Attendance rate
              </th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((student) => (
              <tr key={student.id}>
                <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                  <div className="flex items-center gap-x-4">
                    <div className="bg-indigo-500 rounded-full h-8 w-8 flex items-center justify-center text-white text-base font-bold mr-2">
                      {student.fullName?.charAt(0).toUpperCase()}
                    </div>{" "}
                    <div
                      className="truncate text-sm font-medium leading-6 text-gray-900 cursor-pointer"
                      onClick={() => handleStudentClick(student)}
                    >
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
                        student.eventsAttended?.length >=
                          (departmentSettings?.requiredEvents || 0)
                          ? statuses.Complete
                          : statuses.Incomplete,
                        "flex-none rounded-full p-1"
                      )}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-current" />
                    </div>
                    <div className="hidden text-gray-900 sm:block">
                      {student.eventsAttended?.length >=
                      (departmentSettings?.requiredEvents || 0)
                        ? "Complete"
                        : "Incomplete"}
                    </div>
                  </div>
                </td>
                <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-600 md:table-cell lg:pr-20">
                  {student.eventsAttended?.length || 0}
                </td>
                <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-600 sm:table-cell sm:pr-6 lg:pr-8">
                  {meetingCount === 0
                    ? "N/A"
                    : (
                        (student.eventsAttended.length / meetingCount) *
                        100
                      ).toFixed(2) + "%"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-5 sm:px-6">
        <Pagination
          count={Math.ceil(filteredStudents.length / studentsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
}
