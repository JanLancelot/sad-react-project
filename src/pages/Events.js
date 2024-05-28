import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ReactToPrint from 'react-to-print';

const departmentOptions = [
  { id: 0, name: 'All Departments' },
  { id: 1, name: 'Computer Studies' },
  { id: 2, name: 'Education' },
  { id: 3, name: 'Accountancy' },
  { id: 4, name: 'Business Administration' },
  { id: 5, name: 'Arts and Sciences' },
  { id: 6, name: 'Maritime' },
  { id: 7, name: 'Health Sciences' },
  { id: 8, name: 'Hospitality' },
];

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [department, setDepartment] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      const q = collection(db, 'meetings');
      const querySnapshot = await getDocs(q);
      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    };

    fetchEvents();
  }, []);

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setDepartment(selectedDepartment);

    if (selectedDepartment === 'All Departments') {
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

    if (filterValue === 'all') {
      setFilteredEvents(events);
    } else if (filterValue === 'finished') {
      const filtered = events.filter(
        (event) => new Date(event.endTime) < new Date()
      );
      setFilteredEvents(filtered);
    } else if (filterValue === 'upcoming') {
      const filtered = events.filter(
        (event) => new Date(event.startTime) > new Date()
      );
      setFilteredEvents(filtered);
    } else if (filterValue === 'between') {
      // Filter events between start and end dates
      const filtered = events.filter(
        (event) =>
          new Date(event.startTime) >= new Date(startDate) &&
          new Date(event.endTime) <= new Date(endDate)
      );
      setFilteredEvents(filtered);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    handleEventFilterChange({ target: { value: 'between' } });
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    handleEventFilterChange({ target: { value: 'between' } });
  };

  const componentRef = React.createRef();

  return (
    <div className="container mx-auto my-8">
      <div className="mb-4">
        <label className="mr-2">Filter by Department:</label>
        <select
          value={department}
          onChange={handleDepartmentChange}
          className="border border-gray-300 rounded px-2 py-1 mr-4"
        >
          {departmentOptions.map((option) => (
            <option key={option.id} value={option.name}>
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

        {eventFilter === 'between' && (
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
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Event Name</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Start Time</th>
              <th className="px-4 py-2 border">End Time</th>
              <th className="px-4 py-2 border">Department</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td className="border px-4 py-2">{event.name}</td>
                <td className="border px-4 py-2">{event.description}</td>
                <td className="border px-4 py-2">
                  {new Date(event.startTime).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {new Date(event.endTime).toLocaleString()}
                </td>
                <td className="border px-4 py-2">{event.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Events;