import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { pdf, BlobProvider } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import Layout from "./Layout";
import memoize from "memoize-one";

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333333",
  },
  subheader: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: "#666666",
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "12.5%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableHeader: {
    backgroundColor: "#f2f2f2",
    fontWeight: "bold",
    fontSize: 16,
    color: "#333333",
  },
});


const EventChart = React.memo(() => {
  const [pastEvents, setPastEvents] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  // const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [secondaryNavigation, setSecondaryNavigation] = useState([
    { name: "Computer Studies", dval: "CS department", current: true },
    { name: "Education", dval: "Education Department", current: false },
    { name: "Accountancy", dval: "Accountancy Department", current: false },
    {
      name: "Business Administration",
      dval: "Business Administration Department",
      current: false,
    },
    {
      name: "Arts and Sciences",
      dval: "Arts and Sciences Department",
      current: false,
    },
    { name: "Maritime", dval: "Maritime Department", current: false },
    {
      name: "Health Sciences",
      dval: "Health Sciences Department",
      current: false,
    },
    {
      name: "Hospitality Management and Tourism",
      dval: "Hospitality Management and Tourism Department",
      current: false,
    },
  ]);
  const [dateRange, setDateRange] = useState("month");
  // const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [userFullName, setUserFullName] = useState("");

  const [events, setEvents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());


  const db = getFirestore();

const handleNavItemClick = useCallback((item) => {
  setSecondaryNavigation((prevNavigation) =>
    prevNavigation.map((nav) =>
      nav.name === item.name ? { ...nav, current: true } : { ...nav, current: false }
    )
  );
  setSelectedDepartment(item.dval);
}, []);


useEffect(() => {
  const fetchUserFullName = async () => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          setUserFullName(userDocSnapshot.data().fullName);
        } else {
          console.log("User document does not exist");
        }
      } else {
        console.log("No user is signed in");
      }
    });
  };
  fetchUserFullName();
}, [db]);


const fetchData = useCallback(async () => {
  const dept = secondaryNavigation.find((item) => item.current)?.dval || "";
  setSelectedDepartment(dept);

  const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

  const eventsQuery = query(
    collection(db, "meetings"),
    where("department", "in", [dept, "All"]),
    where("date", ">=", firstDay.toISOString().slice(0, 10)),
    where("date", "<=", lastDay.toISOString().slice(0, 10))
  );

  const querySnapshot = await getDocs(eventsQuery);
  const eventsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
    const evaluationsQuery = collection(doc.ref, "evaluations");
    const evaluationsSnapshot = await getDocs(evaluationsQuery);
    const evaluations = evaluationsSnapshot.docs.map((evaluationDoc) => evaluationDoc.data());
    const averageRating = evaluations.length > 0
      ? evaluations.reduce((acc, evaluation) => acc + evaluation.averageRating, 0) / evaluations.length
      : "N/A";

    return {
      id: doc.id,
      ...doc.data(),
      averageRating,
    };
  }));
  setEvents(eventsData);
}, [db, secondaryNavigation, selectedMonth]);




  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pastEventData = useMemo(
    () =>
      pastEvents.map((event) => ({
        name: event.name,
        category: event.category,
        attendees: event.attendees?.length || 0,
      })),
    [pastEvents]
  );

  const eventData = useMemo(() =>
    events.map((event) => ({
      name: event.name,
      category: event.category,
      location: event.location,
      organizer: event.organizer,
      attendees: event.attendees?.length || 0,
      interested: event.interestedCount || 0,
      notInterested: event.notInterestedUsers?.length || 0,
      averageRating: event.averageRating,
    }))
  , [events]);
  

  const futureEventData = useMemo(
    () =>
      futureEvents.map((event) => ({
        name: event.name,
        category: event.category,
        interested: event.interestedCount || 0,
        notInterested: event.notInterestedUsers?.length || 0,
      })),
    [futureEvents]
  );

  const memoizedMyPDF = useMemo(() => (
    <Document>
      <Page size="A3" style={styles.container} orientation="landscape">
        <Text style={styles.header}>Events and Attendants</Text>
        <Text style={styles.subheader}>Department: {selectedDepartment}</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol}>Event Name</Text>
            <Text style={styles.tableCol}>Category</Text>
            <Text style={styles.tableCol}>Location</Text>
            <Text style={styles.tableCol}>Organizer</Text>
            <Text style={styles.tableCol}>Attendants</Text>
            <Text style={styles.tableCol}>Interested</Text>
            <Text style={styles.tableCol}>Not Interested</Text>
            <Text style={styles.tableCol}>Avg Rating</Text>
          </View>
          {eventData.map((event, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCol}>{event.name}</Text>
              <Text style={styles.tableCol}>{event.category}</Text>
              <Text style={styles.tableCol}>{event.location}</Text>
              <Text style={styles.tableCol}>{event.organizer}</Text>
              <Text style={styles.tableCol}>{event.attendees}</Text>
              <Text style={styles.tableCol}>{event.interested}</Text>
              <Text style={styles.tableCol}>{event.notInterested}</Text>
              <Text style={styles.tableCol}>{event.averageRating}</Text>
            </View>
          ))}
        </View>
        <Text style={{ marginTop: 20 }}>Prepared by: {userFullName}</Text>
      </Page>
    </Document>
  ), [eventData, selectedDepartment, userFullName]);
  
  

  const memoizedBlobProvider = useMemo(() =>
    memoize((doc) => (
      <BlobProvider document={doc}>
        {({ url }) => <iframe src={url} width="100%" height="600" />}
      </BlobProvider>
    ))
  , []);
  

  return (
    <Layout>
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
        {/* Date range filter */}
        <div className="mt-4 mx-4 sm:mx-6 lg:mx-8">
          <label htmlFor="dateRange" className="sr-only">
            Date range
          </label>
          <div className="flex space-x-4">
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-700"
              >
                Select Month
              </label>
              <input
                id="month"
                type="month"
                value={
                  selectedMonth ? selectedMonth.toISOString().slice(0, 7) : ""
                }
                onChange={(e) =>
                  setSelectedMonth(new Date(e.target.value + "-01"))
                }
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </header>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 pt-2">Event Chart</h2>
        {memoizedBlobProvider(memoizedMyPDF)}
      </div>
    </Layout>
  );
});

export default EventChart;
