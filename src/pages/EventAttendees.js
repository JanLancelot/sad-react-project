import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Layout from "./Layout";
import QRCode from "react-qr-code";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { FaFilter, FaStar } from "react-icons/fa";
import StarRatings from "react-star-ratings";

function AttendanceChart({ attendeesData }) {
  const data = Object.values(
    attendeesData.reduce((acc, { department, fullName }) => {
      acc[department] = (acc[department] || 0) + 1;
      return acc;
    }, {})
  ).map((count, index) => ({
    name: Object.keys(
      attendeesData.reduce((acc, { department, fullName }) => {
        acc[department] = (acc[department] || 0) + 1;
        return acc;
      }, {})
    )[index],
    value: count,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        color="#000000"
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={120}
        fill="#8884d8"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

const calculateAverageRating = (ratings) => {
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return sum / ratings.length;
};

const countRatings = (ratings) => {
  const counts = [0, 0, 0, 0, 0];
  ratings.forEach((rating) => {
    counts[rating - 1]++;
  });
  return counts;
};

function RatingChart({ ratings }) {
  const counts = countRatings(ratings);
  const data = [
    { name: "1 Star", value: counts[0] },
    { name: "2 Stars", value: counts[1] },
    { name: "3 Stars", value: counts[2] },
    { name: "4 Stars", value: counts[3] },
    { name: "5 Stars", value: counts[4] },
  ];
  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9CCC65"];

  return (
    <PieChart width={200} height={200}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}

function EventAttendees() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [attendeesData, setAttendeesData] = useState([]);
  const [filteredAttendeesData, setFilteredAttendeesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [evaluations, setEvaluations] = useState([]);
  const [averageRatings, setAverageRatings] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [evaluationData, setEvaluationData] = useState({});
  const [questions, setQuestions] = useState([]);

  const navigate = useNavigate();

  const countCoreValues = (coreValues) => {
    const counts = {};
    coreValues.forEach((value) => {
      counts[value] = (counts[value] || 0) + 1;
    });

    const sortedValues = Object.entries(counts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([name, value]) => ({ name, value }));

    return sortedValues;
  };

  function CoreValuesChart({ evaluations }) {
    const coreValues = evaluations.reduce(
      (acc, evaluation) => acc.concat(evaluation.coreValues || []),
      []
    );
    const data = countCoreValues(coreValues);
    console.log("Counted core values", data);

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-gray-700 font-medium">
              <th className="px-4 py-3 text-left">Core Value</th>
              <th className="px-4 py-3 text-left">Count</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 font-medium">
            {data.map((entry, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-4 py-3 text-left">{entry.name}</td>
                <td className="px-4 py-3 text-left">{entry.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  useEffect(() => {
    const fetchEvaluationData = async () => {
      const promises = attendeesData.map(async (attendee) => {
        const evaluationRef = doc(
          db,
          "meetings",
          eventId,
          "evaluations",
          attendee.id
        );
        const evaluationSnapshot = await getDoc(evaluationRef);
        if (evaluationSnapshot.exists()) {
          console.log("Evaluation: ", evaluationSnapshot.data());
          return { id: attendee.id, ...evaluationSnapshot.data() };
        }
        return { id: attendee.id, averageRating: 0 };
      });
      const evaluationData = await Promise.all(promises);
      setEvaluationData(evaluationData);
    };

    fetchEvaluationData();
  }, [attendeesData, eventId]);

  const mergedAttendeesData = attendeesData.map((attendee) => {
    const evaluation = evaluationData.find((ev) => ev.id === attendee.id) || {
      averageRating: 0,
    };
    return { ...attendee, averageRating: evaluation.averageRating };
  });

  const sortAttendees = (attendeesData) => {
    return attendeesData.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.averageRating - b.averageRating;
      } else {
        return b.averageRating - a.averageRating;
      }
    });
  };

  useEffect(() => {
    const sortedData = sortAttendees(mergedAttendeesData);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    setFilteredAttendeesData(
      sortedData.slice(indexOfFirstItem, indexOfLastItem)
    );
  }, [mergedAttendeesData, currentPage, itemsPerPage, evaluationData]);

  useEffect(() => {
    const fetchEventData = async () => {
      const docRef = doc(db, "meetings", eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEventData(docSnap.data());
        if (docSnap.data().attendees && docSnap.data().attendees.length > 0) {
          const attendeeIds = docSnap.data().attendees;
          const usersCollectionRef = collection(db, "users");
          const attendeeDocs = await Promise.all(
            attendeeIds.map((id) => getDoc(doc(usersCollectionRef, id)))
          );
          const attendees = await Promise.all(
            attendeeDocs.map(async (doc) => ({
              id: doc.id,
              fullName: doc.data().fullName,
              department: doc.data().department,
            }))
          );
          setAttendeesData(attendees);
          setFilteredAttendeesData(attendees);
        } else {
          setAttendeesData([]);
          setFilteredAttendeesData([]);
        }

        const evaluationsCollectionRef = collection(docRef, "evaluations");
        const evaluationsDocs = await getDocs(evaluationsCollectionRef);
        const evaluationsData = evaluationsDocs.docs.map((doc) => doc.data());

        const ratingsPerQuestion = Array.from(
          { length: questions.length },
          () => []
        );
        evaluationsData.forEach((evaluation) => {
          evaluation.ratings.forEach((rating, index) => {
            ratingsPerQuestion[index].push(rating);
          });
        });

        const averageRatingsPerQuestion = ratingsPerQuestion.map((ratings) => {
          return ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0;
        });
        setAverageRatings(averageRatingsPerQuestion);
      }
    };

    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    if (eventData && eventData.evaluationId) {
      const fetchQuestions = async () => {
        const evaluationFormRef = doc(
          db,
          "evaluationForms",
          eventData.evaluationId
        );
        const evaluationFormSnap = await getDoc(evaluationFormRef);
        if (evaluationFormSnap.exists()) {
          setQuestions(evaluationFormSnap.data().questions);
        }
      };

      fetchQuestions();
    }
  }, [eventData]);

  const departments = [
    ...new Set(attendeesData.map((attendee) => attendee.department)),
  ];

  const filteredAttendees =
    selectedDepartment === "All"
      ? filteredAttendeesData
      : filteredAttendeesData.filter(
          (attendee) => attendee.department === selectedDepartment
        );

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    const sortedData = sortAttendees(mergedAttendeesData);
    setFilteredAttendeesData(sortedData);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold mb-6">
          {eventData ? eventData.name : "Event"} - Attendees
        </h1>
        <Link to="/events">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Back to Events
          </button>
        </Link>
      </div>

      <div className="mb-4">
        <label htmlFor="departmentFilter" className="mr-2">
          Filter by Department:
        </label>
        <select
          id="departmentFilter"
          value={selectedDepartment}
          onChange={handleDepartmentChange}
        >
          <option value="All">All</option>
          {departments.map((department, index) => (
            <option key={index} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      <div className="flex mb-4">
        <button
          onClick={() => handleSortOrderChange("asc")}
          className={`px-4 py-2 mr-2 ${
            sortOrder === "asc" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Sort by Rating (Asc)
        </button>
        <button
          onClick={() => handleSortOrderChange("desc")}
          className={`px-4 py-2 ${
            sortOrder === "desc" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Sort by Rating (Desc)
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Average Ratings</h2>
        {questions.map((question, index) => (
          <div key={index} className="mb-2">
            <p>{question}</p>
            <StarRatings
              rating={averageRatings[index]}
              starRatedColor="gold"
              numberOfStars={5}
              starDimension="20px"
              starSpacing="2px"
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Core Values Chart</h2>
        <CoreValuesChart evaluations={evaluationData} />
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Attendance Chart</h2>
        <AttendanceChart attendeesData={attendeesData} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200">Name</th>
              <th className="py-2 px-4 border-b border-gray-200">Department</th>
              <th className="py-2 px-4 border-b border-gray-200">Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendees.map((attendee) => (
              <tr key={attendee.id}>
                <td className="py-2 px-4 border-b border-gray-200">
                  {attendee.fullName}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  {attendee.department}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <StarRatings
                    rating={attendee.averageRating}
                    starRatedColor="gold"
                    numberOfStars={5}
                    starDimension="20px"
                    starSpacing="2px"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Previous
        </button>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(attendeesData.length / itemsPerPage))
            )
          }
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </Layout>
  );
}

export default EventAttendees;
