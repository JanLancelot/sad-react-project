import React, { useState } from "react";
import { faker } from "@faker-js/faker";
import { addDoc, collection } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

export default function AddStudentPage() {
  const [studentCount, setStudentCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const db = getFirestore();
  const studentsRef = collection(
    db,
    "students",
    "y1VlAwCIfawwp5tQRueD",
    "hospitality-department"
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      for (let i = 0; i < studentCount; i++) {
        const randomYear = faker.number.int({ min: 2020, max: 2023 });
        const sequentialId = (i + 1).toString().padStart(5, "0");

        const studentData = {
          course: "Computer Science",
          eventsAttended: faker.number.int({ min: 0, max: 15 }),
          fullName: faker.person.fullName(),
          requirements: "",
          schoolEmail: faker.internet.email(),
          studentID: `${randomYear}-${sequentialId}`,
          yearLevel: faker.helpers.arrayElement([
            "1A",
            "1B",
            "2A",
            "2B",
            "3A",
            "3B",
            "4A",
            "4B",
          ]),
        };
        studentData.requirements = studentData.eventsAttended > 10 ? "Complete" : "Incomplete"; 
        await addDoc(studentsRef, studentData);
      }

      console.log(`${studentCount} students added!`);
    } catch (error) {
      setFormError("Failed to add students. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Add New Students</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="studentCount">Number of Students:</label>
        <input
          type="number"
          id="studentCount"
          min="1"
          value={studentCount}
          onChange={(e) => setStudentCount(parseInt(e.target.value, 10) || 1)}
        />
        <button type="submit" disabled={isSubmitting}>
          Add Students
        </button>
      </form>
      {formError && <p className="error-message">{formError}</p>}
    </div>
  );
}
