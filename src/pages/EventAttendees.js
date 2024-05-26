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
      {" "}
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
    const coreValues = evaluations.flatMap(
      (evaluation) => evaluation.coreValues
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
    const fetchEvaluationFormQuestions = async () => {
      if (eventData && eventData.evaluationId) {
        const evaluationFormsRef = doc(
          db,
          "evaluationForms",
          eventData.evaluationId
        );
        const evaluationFormSnapshot = await getDoc(evaluationFormsRef);

        if (evaluationFormSnapshot.exists()) {
          const evaluationFormData = evaluationFormSnapshot.data();
          setQuestions(evaluationFormData.questions || []);
        }
      }
    };

    fetchEvaluationFormQuestions();
  }, [eventData]);

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

        const ratingsPerQuestion = Array.from({ length: 10 }, () => []);
        evaluationsData.forEach((evaluation) => {
          evaluation.ratings.forEach((rating, index) => {
            ratingsPerQuestion[index].push(rating);
          });
        });

        const averageRatings = ratingsPerQuestion.map((ratings) =>
          calculateAverageRating(ratings)
        );

        setEvaluations(evaluationsData);
        setAverageRatings(averageRatings);
      } else {
      }
    };
    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    if (attendeesData && attendeesData.length > 0) {
      const filteredData =
        selectedDepartment === "All"
          ? attendeesData
          : attendeesData.filter(
              (attendee) => attendee.department === selectedDepartment
            );
      setFilteredAttendeesData(
        filteredData.slice(indexOfFirstItem, indexOfLastItem)
      );
    } else {
      setFilteredAttendeesData([]);
    }
  }, [currentPage, itemsPerPage, attendeesData, selectedDepartment]);

  const handleAttendeeClick = (evalId) => {
    navigate(`/events/${eventId}/attendees/evalform/${evalId}`);
  };

  const onImageDownload = () => {
    const svg = document.getElementById("QRCode");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${eventData.name}-qrcode`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDepartmentFilter = (department) => {
    setSelectedDepartment(department);
    setCurrentPage(1);
  };

  if (!eventData) {
    return <div>Loading...</div>;
  }

  const departments = [
    "All",
    ...new Set(attendeesData.map((attendee) => attendee.department)),
  ];

  // const questions = [
  //   "The activity was in-line with the DYCI Vision-Mission and core values.",
  //   "The activity achieved its goals/objectives (or theme).",
  //   "The activity met the need of the students.",
  //   "The committees performed their service.",
  //   "The activity was well-participated by the students.",
  //   "The date and time was appropriate for the activity.",
  //   "The venue was appropriate for the activity.",
  //   "The school resources were properly managed.",
  //   "The activity was well organized and well planned.",
  //   "The activity was well attended by the participants.",
  // ];

  function RatingDisplay({ rating }) {
    return (
      <StarRatings
        rating={rating}
        starRatedColor="#FFC107"
        starEmptyColor="#E0E0E0"
        starDimension="20px"
        starSpacing="2px"
      />
    );
  }

  const handleSortRating = (order) => {
    setSortOrder(order);
    const sortedData = sortAttendees(mergedAttendeesData);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const filteredData =
      selectedDepartment === "All"
        ? sortedData
        : sortedData.filter(
            (attendee) => attendee.department === selectedDepartment
          );
    setFilteredAttendeesData(
      filteredData.slice(indexOfFirstItem, indexOfLastItem)
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {eventData.name}
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Attendees</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-500" />
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedDepartment}
              onChange={(e) => handleDepartmentFilter(e.target.value)}
              style={{
                paddingRight: "30px",
              }}
            >
              {departments.map((department, index) => (
                <option key={index} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="itemsPerPage" className="mr-2">
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              style={{
                width: "100px",
                paddingRight: "20px",
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>50</option>
            </select>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Sort by Rating:</span>
            {/* Ascending button */}
            <button
              className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                sortOrder === "asc"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
              onClick={() => handleSortRating("asc")}
            >
              Ascending
            </button>
            {/* Descending button */}
            <button
              className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                sortOrder === "desc"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              } ml-2`}
              onClick={() => handleSortRating("desc")}
            >
              Descending
            </button>
          </div>
        </div>
        {filteredAttendeesData.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-medium">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {/* Iterate over the filteredAttendeesData */}
                {filteredAttendeesData.map(
                  ({ fullName, department, id, averageRating }, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-3">
                        <Link
                          to={`/events/${eventId}/attendees/evalform/${id}`}
                          onClick={() => handleAttendeeClick(id)}
                        >
                          {fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{department}</td>
                      <td className="px-4 py-3">{averageRating}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
            <div className="flex justify-center mt-6">
              <nav>
                <ul className="inline-flex -space-x-px">
                  {Array.from(
                    { length: Math.ceil(attendeesData.length / itemsPerPage) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <li key={page}>
                      <button
                        className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                          currentPage === page ? "bg-blue-500 text-white" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No attendees yet.</p>
        )}
      </div>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="flex flex-col md:flex-row items-center justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500 mr-4 mb-4">
            <QRCode
              size={256}
              id="QRCode"
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={`${eventId}-checkin`}
              viewBox={`0 0 256 256`}
            />
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
              onClick={() => onImageDownload("checkin")}
            >
              Download Check-in QR Code
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-500 mb-4">
            <QRCode
              size={256}
              id="QRCode"
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={`${eventId}-checkout`}
              viewBox={`0 0 256 256`}
            />
            <button
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
              onClick={() => onImageDownload("checkout")}
            >
              Download Check-out QR Code
            </button>
          </div>
        </div>
        {attendeesData.length > 0 && (
          <AttendanceChart attendeesData={attendeesData} />
        )}
        {evaluationData.length > 0 && (
          <div className="mt-8 overflow-x-auto w-full">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Evaluation Ratings
            </h2>
            <div className="md:w-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-medium">
                    <th className="px-4 py-3 text-left">Question</th>
                    <th className="px-4 py-3 text-left">Average Rating</th>
                    <th className="px-4 py-3 text-left">Rating Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {averageRatings.map((rating, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-3">{questions[index]}</td>
                      <td className="px-4 py-3">
                        <RatingDisplay rating={rating} />
                      </td>
                      <td className="px-4 py-3">
                        <RatingChart
                          ratings={evaluations.map(
                            (evaluation) => evaluation.ratings[index]
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="container mx-auto px-4 py-8 overflow-x-auto w-full">
              {evaluationData.length > 0 && (
                <div className="mt-8 overflow-x-auto w-full">
                  {/* ... Evaluation Ratings table ... */}
                  <div className="container mx-auto px-4 py-8 overflow-x-auto w-full">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                      Most Common Core Values
                    </h2>
                    <CoreValuesChart evaluations={evaluations} />{" "}
                    {/* Render the chart */}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-center">
          <nav>
            <ul className="inline-flex -space-x-px">
              {Array.from(
                { length: Math.ceil(attendeesData.length / itemsPerPage) },
                (_, i) => i + 1
              ).map((page) => (
                <li key={page}>
                  <button
                    className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                      currentPage === page ? "bg-blue-500 text-white" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </Layout>
  );
}
export default EventAttendees;
