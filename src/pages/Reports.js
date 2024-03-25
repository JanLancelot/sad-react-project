import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
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

const secondaryNavigation = [
 { name: "Computer Studies", href: "/computer-studies", current: true },
 { name: "Education", href: "/education", current: false },
 { name: "Accountancy", href: "/accountancy", current: false },
 {
   name: "Business Administration",
   href: "/business-administration",
   current: false,
 },
 { name: "Arts and Sciences", href: "/arts-and-sciences", current: false },
 { name: "Maritime", href: "/maritime", current: false },
 { name: "Health Sciences", href: "/health-sciences", current: false },
 {
   name: "Hospitality Management and Tourism",
   href: "/hospitality",
   current: false,
 },
];

const EventChart = () => {
 const [events, setEvents] = useState([]);
 const db = getFirestore();

 useEffect(() => {
   const fetchData = async () => {
     const querySnapshot = await getDocs(collection(db, "meetings"));
     const fetchedMeetings = [];
     querySnapshot.forEach((doc) => {
       fetchedMeetings.push({ id: doc.id, ...doc.data() });
     });

     const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); 
     const filteredMeetings = fetchedMeetings.filter(event => {
       const [year, month, day] = event.date.split('-').map(Number); 
       const meetingDate = new Date(year, month - 1, day); // Month is zero-indexed

       return meetingDate <= oneWeekAgo; 
     });

     setEvents(filteredMeetings); 
   };
   fetchData();
 }, []);

 const data = events.map((event) => ({
   name: event.name,
   attendees: event.attendees,
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
                   href={item.href}
                   className={item.current ? "text-indigo-600" : ""}
                 >
                   {item.name}
                 </a>
               </li>
             ))}
           </ul>
         </nav>
       </header>
       <BarChart width={1200} height={400} data={data}>
         <XAxis dataKey="name" interval={0} />
         <YAxis />
         <Tooltip />
         <Legend />
         <CartesianGrid strokeDasharray="3 3" />
         <Bar dataKey="attendees" fill="#8884d8" />
       </BarChart>
     </main>
   </Layout>
 );
};

export default EventChart;
