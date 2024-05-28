import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
  
    if (selectedDepartment === '') {
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
        (event) => new Date(event.date.split('/').reverse().join('-')) < new Date()
      );
      setFilteredEvents(filtered);
    } else if (filterValue === 'upcoming') {
      const filtered = events.filter(
        (event) => new Date(event.date.split('/').reverse().join('-')) > new Date()
      );
      setFilteredEvents(filtered);
    } else if (filterValue === 'between') {
      const start = new Date(startDate.split('-').reverse().join('-'));
      const end = new Date(endDate.split('-').reverse().join('-'));
      const filtered = events.filter((event) => {
        const eventDate = new Date(event.date.split('/').reverse().join('-'));
        return eventDate >= start && eventDate <= end;
      });
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
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Department</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td className="border px-4 py-2">{event.name}</td>
                <td className="border px-4 py-2">{event.description}</td>
                <td className="border px-4 py-2">
                  {new Date(event.date.split('/').reverse().join('-')).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">{event.category}</td>
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
