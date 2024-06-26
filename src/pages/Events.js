import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Layout from "./Layout";
import ReactToPrint from "react-to-print";
import { useNavigate } from "react-router-dom";

const departmentOptions = [
  { id: 0, name: "Select Department", color: "", dbl: "" },
  {
    id: 1,
    name: "Computer Studies",
    color: "bg-blue-400",
    dbl: "CS department",
  },
  {
    id: 2,
    name: "Education",
    color: "bg-green-400",
    dbl: "Education Department",
  },
  {
    id: 3,
    name: "Accountancy",
    color: "bg-yellow-400",
    dbl: "Accountancy Department",
  },
  {
    id: 4,
    name: "Business Administration",
    color: "bg-purple-400",
    dbl: "Business Administration Department",
  },
  {
    id: 5,
    name: "Arts and Sciences",
    color: "bg-pink-400",
    dbl: "Arts and Sciences Department",
  },
  { id: 6, name: "Maritime", color: "bg-teal-400", dbl: "Maritime department" },
  {
    id: 7,
    name: "Health Sciences",
    color: "bg-red-400",
    dbl: "Health Sciences Department",
  },
  {
    id: 8,
    name: "Hospitality",
    color: "bg-orange-400",
    dbl: "Hospitality Management and Tourism Department",
  },
];

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [department, setDepartment] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const q = collection(db, "meetings");
      const querySnapshot = await getDocs(q);
      const eventsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const evaluationsRef = collection(
            db,
            "meetings",
            doc.id,
            "evaluations"
          );
          const evaluationsSnapshot = await getDocs(evaluationsRef);
          const ratings = evaluationsSnapshot.docs.map(
            (evaluation) => evaluation.data().averageRating
          );
          const averageScore = ratings.length
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
            : "N/A";

          const attendees = doc.data().attendees || [];
          const numberOfAttendees = attendees.length;

          return {
            id: doc.id,
            ...doc.data(),
            averageScore: parseFloat(averageScore),
            numberOfAttendees,
          };
        })
      );
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    };

    fetchEvents();
  }, []);

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setDepartment(selectedDepartment);

    if (selectedDepartment === "") {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(
        (event) => event.department === selectedDepartment
      );
      setFilteredEvents(filtered);
    }
  };

  const handleEventFilterChange = (e) => {
    const filterValue = e.target.value;
    setEventFilter(filterValue);

    if (filterValue === "all") {
      setFilteredEvents(events);
    } else if (filterValue === "finished") {
      const filtered = events.filter(
        (event) =>
          new Date(event.date.split("/").reverse().join("-")) < new Date()
      );
      setFilteredEvents(filtered);
    } else if (filterValue === "upcoming") {
      const filtered = events.filter(
        (event) =>
          new Date(event.date.split("/").reverse().join("-")) > new Date()
      );
      setFilteredEvents(filtered);
    } else if (filterValue === "between") {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const filtered = events.filter((event) => {
        const eventDate = new Date(event.date.split("/").reverse().join("-"));
        return eventDate >= start && eventDate <= end;
      });
      setFilteredEvents(filtered);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    handleEventFilterChange({ target: { value: "between" } });
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    handleEventFilterChange({ target: { value: "between" } });
  };

  const handleSortByScore = () => {
    if (filteredEvents.length === 0) {
      return;
    }

    const sortedEvents = [...filteredEvents].sort((a, b) => {
      const aScore = isNaN(a.averageScore) ? -Infinity : a.averageScore;
      const bScore = isNaN(b.averageScore) ? -Infinity : b.averageScore;

      if (sortOrder === "asc") {
        return aScore - bScore;
      } else {
        return bScore - aScore;
      }
    });

    setFilteredEvents(sortedEvents);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const componentRef = React.createRef();

  return (
    <Layout>
      <div className="container mx-auto my-8">
        <div className="mb-4">
          <label className="mr-2">Filter by Department:</label>
          <select
            value={department}
            onChange={handleDepartmentChange}
            className="border border-gray-300 rounded px-2 py-1 mr-4"
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

          <label className="mr-2">Filter Events:</label>
          <select
            value={eventFilter}
            onChange={handleEventFilterChange}
            className="border border-gray-300 rounded px-2 py-1 mr-4"
          >
            <option value="all">All Events</option>
            <option value="finished">Finished Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="between">Events Between Dates</option>
          </select>

          {eventFilter === "between" && (
            <div>
              <label className="mr-2">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="border border-gray-300 rounded px-2 py-1 mr-4"
              />

              <label className="mr-2">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="border border-gray-300 rounded px-2 py-1"
              />
            </div>
          )}
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                  <button
                    onClick={handleSortByScore}
                    className="ml-2 text-xs font-medium text-blue-500"
                  >
                    Sort by Score
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number of Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer text-blue-500"
                    onClick={() => handleEventClick(event.id)}
                  >
                    {event.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.numberOfAttendees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.averageScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Events;
