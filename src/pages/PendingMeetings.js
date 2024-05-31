import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PendingMeetings() {
  const [pendingMeetings, setPendingMeetings] = useState([]);
  const [adRole, setAdRole] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setAdRole(userDoc.data().adRole);
          } else {
            console.log("User document not found");
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      } else {
        setAdRole(null);
      }
    });

    return unsubscribe;
  }, [auth]);

  useEffect(() => {
    const fetchPendingMeetings = async () => {
      const pendingMeetingsCollection = collection(db, "pendingMeetings");
      const querySnapshot = await getDocs(pendingMeetingsCollection);
      const meetings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingMeetings(meetings);
    };

    fetchPendingMeetings();
  }, []);

  const handleApprove = async (meetingId) => {
    try {
      const meetingRef = doc(db, "pendingMeetings", meetingId);
      await updateDoc(meetingRef, { pending: false });

      const meetingData = pendingMeetings.find(
        (meeting) => meeting.id === meetingId
      );
      const newMeetingData = { ...meetingData, pending: false };

      const newMeetingRef = await addDoc(
        collection(db, "meetings"),
        newMeetingData
      );

      await deleteDoc(meetingRef);

      setPendingMeetings(
        pendingMeetings.filter((meeting) => meeting.id !== meetingId)
      );

      toast.success("Event approved!");
    } catch (error) {
      console.error("Error approving event:", error);
      toast.error("Error approving event.");
    }
  };

  const handleReject = async (meetingId) => {
    try {
      const meetingRef = doc(db, "pendingMeetings", meetingId);
      await deleteDoc(meetingRef);

      setPendingMeetings(
        pendingMeetings.filter((meeting) => meeting.id !== meetingId)
      );

      toast.info("Event rejected!");
    } catch (error) {
      console.error("Error rejecting event:", error);
      toast.error("Error rejecting event.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pending Events
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Department
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingMeetings.map((meeting) => (
                <tr key={meeting.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {meeting.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meeting.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meeting.startTime} - {meeting.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meeting.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meeting.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleApprove(meeting.id)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(meeting.id)}
                      className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ToastContainer />
      </div>
    </Layout>
  );
}

export default PendingMeetings;
