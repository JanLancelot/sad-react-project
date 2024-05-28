import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, getDoc, collectionGroup } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ReactToPrint from 'react-to-print';

const departmentOptions = [
  { id: 0, name: 'Select Department', color: '', dbl: '' },
  { id: 1, name: 'Computer Studies', color: 'bg-blue-400', dbl: 'CS department' },
  { id: 2, name: 'Education', color: 'bg-green-400', dbl: 'Education Department' },
  { id: 3, name: 'Accountancy', color: 'bg-yellow-400', dbl: 'Accountancy Department' },
  { id: 4, name: 'Business Administration', color: 'bg-purple-400', dbl: 'Business Administration Department' },
  { id: 5, name: 'Arts and Sciences', color: 'bg-pink-400', dbl: 'Arts and Sciences Department' },
  { id: 6, name: 'Maritime', color: 'bg-teal-400', dbl: 'Maritime department' },
  { id: 7, name: 'Health Sciences', color: 'bg-red-400', dbl: 'Health Sciences Department' },
  { id: 8, name: 'Hospitality', color: 'bg-orange-400', dbl: 'Hospitality Management and Tourism Department' },
];

function StudentMasterlist() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      const q = collection(db, 'users');
      const querySnapshot = await getDocs(q);
      const studentsData = await Promise.all(
        querySnapshot.docs
          .map(async (doc) => {
            const studentData = doc.data();
            const evaluationsRef = collection(db, 'users', doc.id, 'evaluations');
            const evaluationsSnapshot = await getDocs(evaluationsRef);
            const averageScore =
              evaluationsSnapshot.docs.length > 0
                ? evaluationsSnapshot.docs
                    .map((evaluationDoc) => evaluationDoc.data().averageRating)
                    .reduce((sum, rating) => sum + rating, 0) / evaluationsSnapshot.docs.length
                : null;
            return {
              id: doc.id,
              ...studentData,
              averageScore,
            };
          })
          .filter((student) => student.department)
      );
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    };

    fetchStudents();
  }, []);

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setDepartment(selectedDepartment);

    if (selectedDepartment) {
      const filtered = students.filter(
        (student) => student.department === selectedDepartment
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  };

  const componentRef = React.createRef();

  return (
    <div className="container mx-auto my-8">
      <div className="mb-4">
        <label className="mr-2">Filter by Department:</label>
        <select
          value={department}
          onChange={handleDepartmentChange}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {departmentOptions.map((option) => (
            <option
              key={option.id}
              value={option.dbl}
              className={option.color}
            >
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <ReactToPrint
        trigger={() => (
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
            Print
          </button>
        )}
        content={() => componentRef.current}
      />

      <div ref={componentRef}>
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Student Number</th>
              <th className="px-4 py-2 border">Full Name</th>
              <th className="px-4 py-2 border">Department</th>
              <th className="px-4 py-2 border">Year Section</th>
              <th className="px-4 py-2 border">Average Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="border px-4 py-2">{student.studentNumber}</td>
                <td className="border px-4 py-2">{student.fullName}</td>
                <td className="border px-4 py-2">{student.department}</td>
                <td className="border px-4 py-2">{student.yearSection}</td>
                <td className="border px-4 py-2">{student.averageScore !== null ? student.averageScore.toFixed(2) : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentMasterlist;
