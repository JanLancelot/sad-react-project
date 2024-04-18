import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Layout from "./Layout";

const EventChart = () => {
  const [pastEvents, setPastEvents] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [secondaryNavigation, setSecondaryNavigation] = useState([
    { name: "Computer Studies", dval: 'CS department', current: true },
    { name: "Education", dval: 'Education Department', current: false },
    { name: "Accountancy", dval: 'Accountancy Department', current: false },
    {
      name: "Business Administration",
      dval: 'Business Administration Department',
      current: false,
    },
    { name: "Arts and Sciences", dval: 'Arts and Sciences Department', current: false },
    { name: "Maritime", dval: 'Maritime Department', current: false },
    { name: "Health Sciences", dval:'Health Sciences Department', current: false },
    {
      name: "Hospitality Management and Tourism",
      dval: 'Hospitality Management and Tourism Department',
      current: false,
    },
  ]);

  const db = getFirestore();

  const handleNavItemClick = (item) => {
    setSecondaryNavigation((prevNavigation) =>
      prevNavigation.map((nav) =>
        nav.name === item.name ? { ...nav, current: true } : { ...nav, current: false }
      )
    );
    setSelectedDepartment([item.dval]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const dept = secondaryNavigation.filter(item => item.current === true).map(item => item.dval);
      setSelectedDepartment(dept);

      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const pastEventsQuery = query(
        collection(db, "meetings"),
        where("department", "in", [...dept, "All"]),
        where("date", ">=", oneWeekAgo.toISOString().slice(0, 10)),
        where("date", "<", today.toISOString().slice(0, 10))
      );
      const pastQuerySnapshot = await getDocs(pastEventsQuery);
      const pastMeetings = pastQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPastEvents(pastMeetings);

      const futureEventsQuery = query(
        collection(db, "meetings"),
        where("department", "in", [...dept, "All"]),
        where("date", ">=", today.toISOString().slice(0, 10)),
        where("date", "<=", oneWeekFromNow.toISOString().slice(0, 10))
      );
      const futureQuerySnapshot = await getDocs(futureEventsQuery);
      const futureMeetings = futureQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFutureEvents(futureMeetings);
    };
    fetchData();
  }, [selectedDepartment, secondaryNavigation]);

  const pastEventData = pastEvents.map((event) => ({
    name: event.name,
    attendees: event.attendees?.length || 0,
  }));

  const futureEventData = futureEvents.map((event) => ({
    name: event.name,
    interested: event.interestedCount || 0,
    notInterested: event.notInterestedUsers?.length || 0,
  }));
  
  return (
    <Layout>
      <main>
        <header>
          {/* Secondary navigation */}
          <nav className="flex overflow-x-auto border-b border-gray-200 py-4">
            <ul
              role="list"
              className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-600 sm:px-6 lg:px-8"
            >
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <a
                    href="#"
                    className={item.current ? "text-indigo-600" : ""}
                    onClick={() => handleNavItemClick(item)}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Events in the past week</h2>
          <div className="flex justify-center">
            <BarChart width={1200} height={400} data={pastEventData}>
              <XAxis dataKey="name" interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="attendees" fill="#8884d8" />
            </BarChart>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Events in the next week</h2>
          <div className="flex justify-center">
            <BarChart width={1200} height={400} data={futureEventData}>
              <XAxis dataKey="name" interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="interested" fill="#82ca9d" />
              <Bar dataKey="notInterested" fill="#ff7300" />
            </BarChart>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default EventChart;