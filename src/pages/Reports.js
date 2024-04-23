import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
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
    width: "33.33%", // Change the width to 33.33% for three columns
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
  const [selectedDepartment, setSelectedDepartment] = useState([]);
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

  const db = getFirestore();

  const handleNavItemClick = useCallback((item) => {
    setSecondaryNavigation((prevNavigation) =>
      prevNavigation.map((nav) =>
        nav.name === item.name
          ? { ...nav, current: true }
          : { ...nav, current: false }
      )
    );
    setSelectedDepartment([item.dval]);
  }, []);

  const fetchData = useCallback(async () => {
    const dept = secondaryNavigation
      .filter((item) => item.current === true)
      .map((item) => item.dval);
    setSelectedDepartment(dept);

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    const pastEventsQuery = query(
      collection(db, "meetings"),
      where("department", "in", [...dept, "All"]),
      where("date", ">=", firstDayOfMonth.toISOString().slice(0, 10)),
      where("date", "<=", lastDayOfMonth.toISOString().slice(0, 10))
    );

    const pastQuerySnapshot = await getDocs(pastEventsQuery);
    const pastMeetings = pastQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPastEvents(pastMeetings);

    setFutureEvents([]); // Clear future events since we're only showing past events
  }, [selectedDepartment, secondaryNavigation, db]);

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

  const memoizedMyPDF = useMemo(
    () => (
      <Document>
        <Page size="A4" style={styles.container}>
          <Text style={styles.header}>Events and Attendants</Text>
          <Text style={styles.subheader}>
            Department: {selectedDepartment.join(", ")}
          </Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCol}>Event Name</Text>
              <Text style={styles.tableCol}>Category</Text>
              <Text style={styles.tableCol}>Attendants</Text>
            </View>
            {[...pastEvents, ...futureEvents].map((event, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol}>{event.name}</Text>
                <Text style={styles.tableCol}>{event.category}</Text>
                <Text style={styles.tableCol}>
                  {event.attendees?.length || 0}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    ),
    [pastEvents, futureEvents, selectedDepartment]
  );

  const memoizedBlobProvider = useMemo(
    () =>
      memoize((doc) => (
        <BlobProvider document={doc}>
          {({ url }) => <iframe src={url} width="100%" height="600" />}
        </BlobProvider>
      )),
    []
  );

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
      </header>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 pt-2">Event Chart</h2>
        {memoizedBlobProvider(memoizedMyPDF)}
      </div>
    </Layout>
  );
});

export default EventChart;
