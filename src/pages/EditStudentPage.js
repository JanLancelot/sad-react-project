import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import LoadingSpinner from './components/LoadingSpinner';
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

const EditStudentPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentDocRef = doc(db, "users", id);
        const studentDocSnapshot = await getDoc(studentDocRef);
        if (studentDocSnapshot.exists()) {
          setStudent(studentDocSnapshot.data());
        } else {
          alert("Student not found.");
          navigate("/computer-studies");
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        alert("An error occurred while fetching student data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentData();
  }, [db, id, navigate]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!student.fullName) {
      newErrors.fullName = "Full Name is required";
    }
    if (!student.studentNumber) {
      newErrors.studentNumber = "Student Number is required";
    }
    if (!student.yearSection) {
      newErrors.yearSection = "Year Section is required";
    }
    if (!student.email) {
      newErrors.email = "Email is required";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const userDocRef = doc(db, "users", id);
      await updateDoc(userDocRef, student);
      alert("Student updated successfully.");
      navigate("/computer-studies");
    } catch (error) {
      console.error("Error updating student:", error);
      alert("An error occurred while updating student.");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            Edit Student Details
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={student.fullName || ""}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="studentNumber" className="block text-gray-700 text-sm font-bold mb-2">
                Student Number
              </label>
              <input
                type="text"
                id="studentNumber"
                name="studentNumber"
                value={student.studentNumber || ""}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.studentNumber ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.studentNumber && <p className="text-red-500 text-xs mt-1">{errors.studentNumber}</p>}
            </div>
            <div>
              <label htmlFor="yearSection" className="block text-gray-700 text-sm font-bold mb-2">
                Year Section
              </label>
              <input
                type="text"
                id="yearSection"
                name="yearSection"
                value={student.yearSection || ""}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.yearSection ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.yearSection && <p className="text-red-500 text-xs mt-1">{errors.yearSection}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={student.email || ""}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus-shadow-outline"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditStudentPage;