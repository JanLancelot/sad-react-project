import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import Layout from "./Layout";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import Map from "./Map";

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [rsvpLink, setRsvpLink] = useState("");
  const [cost, setCost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);
  const [locationType, setLocationType] = useState("in-campus");
  const [mapVisible, setMapVisible] = useState(false);
  const [markedLocation, setMarkedLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      const docRef = doc(db, "meetings", eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEventData(docSnap.data());
        setEventName(docSnap.data().name);
        setEventDate(docSnap.data().date);
        setEventStartTime(docSnap.data().startTime);
        setEventEndTime(docSnap.data().endTime);
        setLocation(docSnap.data().location);
        setDescription(docSnap.data().description);
        setOrganizer(docSnap.data().organizer);
        setCategory(docSnap.data().category);
        setDepartment(docSnap.data().department);
        setRsvpLink(docSnap.data().rsvpLink);
        setCost(docSnap.data().cost);

        const inCampusLocations = [
          "Sapientia Building",
          "Elementary Court",
          "Main Court",
        ];
        setLocationType(
          inCampusLocations.includes(docSnap.data().location)
            ? "in-campus"
            : "off-campus"
        );

        if (docSnap.data().latitude && docSnap.data().longitude) {
          setMarkedLocation({
            lat: docSnap.data().latitude,
            lng: docSnap.data().longitude,
          });
          setMapVisible(true);
        } else {
          setMarkedLocation(null);
          setMapVisible(false);
        }
      } else {
        console.log("Event not found");
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedEvent = {
      name: eventName,
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      location: location,
      description: description,
      organizer: organizer,
      category: category,
      department: department,
      rsvpLink: rsvpLink,
      cost: cost,
    };

    if (locationType === "in-campus") {
      switch (location) {
        case "Main Court":
          updatedEvent.latitude = 14.80114618770356;
          updatedEvent.longitude = 120.92159439914742;
          break;
        case "Sapientia Building":
          updatedEvent.latitude = 14.802052021477655;
          updatedEvent.longitude = 120.92138387564394;
          break;
        case "Elementary Court":
          updatedEvent.latitude = 14.799704034616287;
          updatedEvent.longitude = 120.92779066343971;
          break;
        default:
          updatedEvent.latitude = null;
          updatedEvent.longitude = null;
      }
    } else {
      updatedEvent.latitude = markedLocation?.lat;
      updatedEvent.longitude = markedLocation?.lng;
    }

    const docRef = doc(db, "meetings", eventId);
    await updateDoc(docRef, updatedEvent);

    const currentUser = auth.currentUser;
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDocSnapshot = await getDoc(userDocRef);
    const username = userDocSnapshot.data().fullName;

    await addDoc(collection(db, "activityFeed"), {
      eventId: eventId,
      eventName: eventName,
      username: username,
      userImageUrl: "https://www.ledr.com/colours/black.jpg",
      eventType: "event_updated",
      timestamp: Date.now(),
    });

    console.log("Event updated successfully!");
    navigate("/calendar");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const docRef = doc(db, "meetings", eventId);
      await deleteDoc(docRef);

      const currentUser = auth.currentUser;
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      const username = userDocSnapshot.data().fullName;

      await addDoc(collection(db, "activityFeed"), {
        eventId: eventId,
        eventName: eventName,
        username: username,
        userImageUrl: "https://www.ledr.com/colours/black.jpg",
        eventType: "event_deleted",
        timestamp: Date.now(),
      });

      navigate("/calendar");
    }
  };

  const handleCancel = () => {
    navigate("/calendar");
  };

  const handleLocationTypeChange = (e) => {
    setLocationType(e.target.value);
    if (e.target.value === "off-campus") {
      setMapVisible(true);
    } else {
      setMapVisible(false);
      setMarkedLocation(null);
    }
  };

  const handleMapMarker = (lat, lng) => {
    setMarkedLocation({ lat, lng });
  };

  if (!eventData) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="eventname"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Event Name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="eventname"
                        id="eventname"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="eventdate"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Event Date
                    </label>
                    <div className="mt-2">
                      <input
                        type="date"
                        name="eventdate"
                        id="eventdate"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="eventstarttime"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Event Start Time
                    </label>
                    <div className="mt-2">
                      <input
                        type="time"
                        name="eventstarttime"
                        id="eventstarttime"
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="eventendtime"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Event End Time
                    </label>
                    <div className="mt-2">
                      <input
                        type="time"
                        name="eventendtime"
                        id="eventendtime"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        {locationType === "in-campus" ? "Venue" : "Location"}
                      </label>
                      <div className="relative mt-2 rounded-md shadow-sm">
                        {locationType === "in-campus" ? (
                          <select
                            id="location"
                            name="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          >
                            <option value="">Select a Location</option>
                            <option
                              value="Sapientia Building"
                              key="Sapientia Building"
                            >
                              Sapientia Building
                            </option>
                            <option
                              value="Elementary Court"
                              key="Elementary Court"
                            >
                              Elementary Court
                            </option>
                            <option value="Main Court" key="Main Court">
                              Main Court
                            </option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            name="location"
                            id="location"
                            className="block w-full rounded-md border-0 py-1.5 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Enter a location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        )}
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <label htmlFor="locationType" className="sr-only">
                            Location Type
                          </label>
                          <select
                            id="locationType"
                            name="locationType"
                            value={locationType}
                            onChange={handleLocationTypeChange}
                            className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          >
                            <option value="in-campus">in-campus</option>
                            <option value="off-campus">off-campus</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {mapVisible && (
                      <div className="mt-6">
                        <Map
                          onMarkerDrag={handleMapMarker}
                          markedLocation={markedLocation}
                        />
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Description
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="organizer"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Organizer/Contact
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="organizer"
                        id="organizer"
                        value={organizer}
                        onChange={(e) => setOrganizer(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Category
                    </label>
                    <div className="mt-2">
                      <select
                        id="category"
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Select a Category</option>
                        <option value="lecture">Lecture</option>
                        <option value="workshop">Workshop</option>
                        <option value="social">Social</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="rsvpLink"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      RSVP/Registration Link
                    </label>
                    <div className="mt-2">
                      <input
                        type="url"
                        name="rsvpLink"
                        id="rsvpLink"
                        value={rsvpLink}
                        onChange={(e) => setRsvpLink(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="cost"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Cost
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="cost"
                        id="cost"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Department
                      </label>
                      <div className="relative mt-2 rounded-md shadow-sm">
                        <select
                          id="location"
                          name="location"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="">Select department</option>
                          <option value="CS department" key="CS department">
                            Computer Science department
                          </option>
                          <option
                            value="Education Department"
                            key="Education Department"
                          >
                            Education Department
                          </option>
                          <option
                            value="Accountancy Department"
                            key="Accountancy Department"
                          >
                            Accountancy Department
                          </option>
                          <option
                            value="Business Administration Department"
                            key="Business Administration Department"
                          >
                            Business Administration Department
                          </option>
                          <option
                            value="Arts and Sciences Department"
                            key="Arts and Sciences Department"
                          >
                            Arts and Sciences Department
                          </option>
                          <option
                            value="Maritime Department"
                            key="Maritime Department"
                          >
                            Maritime Department
                          </option>
                          <option
                            value="Health Sciences Department"
                            key="Health Sciences Department"
                          >
                            Health Sciences Department
                          </option>
                          <option
                            value="Hospitality Management and Tourism Department"
                            key="Hospitality Management and Tourism Department"
                          >
                            Hospitality Management and Tourism Department
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-gray-900"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                onClick={handleDelete}
              >
                <TrashIcon className="h-5 w-5" aria-hidden="true" /> Delete
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
