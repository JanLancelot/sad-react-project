import React from "react";
import Layout from "./Layout";
import {
  PhotoIcon,
  UserCircleIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { Fragment, useState, useRef, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  setDoc,
  Timestamp,
  query,
  where,
  getFirestore,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useAuth } from "./components/AuthContext";
import Map from "./Map";
import axios from "axios";

export default function NewEvent({}) {
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
  const [errors, setErrors] = useState({});
  const [mapVisible, setMapVisible] = useState(false);
  const [markedLocation, setMarkedLocation] = useState(null);
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [meetingNames, setMeetingNames] = useState([]);

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const locationInputRef = useRef(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setCurrentUserId(currentUser.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return unsubscribe;
  }, [auth]);

  const [inCampusLocations, setInCampusLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsSnapshot = await getDocs(collection(db, "locations"));
        const locations = locationsSnapshot.docs.map((doc) => doc.data().name);
        setInCampusLocations(locations);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState("");

  const handleAddLocation = async () => {
    if (newLocation.trim() === "") return;

    try {
      const locationsRef = collection(db, "locations");
      await addDoc(locationsRef, { name: newLocation });

      // Fetch the updated list of locations
      const locationsSnapshot = await getDocs(locationsRef);
      const updatedLocations = locationsSnapshot.docs.map(
        (doc) => doc.data().name
      );

      setInCampusLocations(updatedLocations);
      setNewLocation("");
      setShowLocationModal(false);
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  useEffect(() => {
    const fetchMeetingNames = async () => {
      try {
        const meetingsCollection = collection(db, "meetings");
        const querySnapshot = await getDocs(meetingsCollection);
        const names = querySnapshot.docs.map((doc) => doc.data().name);
        setMeetingNames(names);
      } catch (error) {
        console.error("Error fetching meeting names:", error);
      }
    };

    fetchMeetingNames();
  }, []);

  const filterMeetingNames = (inputValue) => {
    return meetingNames.filter((name) =>
      name.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e) => {
    setEventName(e.target.value);
    const filteredNames = filterMeetingNames(e.target.value);
    setSuggestions(filteredNames);
    setShowSuggestions(filteredNames.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setEventName(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };
  const fetchEventsForSelectedDate = async (date) => {
    try {
      const locationsQuery = query(
        collection(db, "meetings"),
        where("date", "==", date),
        where("location", "in", [
          "Main Court",
          "Sapientia Building",
          "Elementary Court",
        ])
      );

      const querySnapshot = await getDocs(locationsQuery);
      const events = querySnapshot.docs.map((doc) => doc.data());
      setEventsForSelectedDate(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleDateChange = (e) => {
    setEventDate(e.target.value);
    fetchEventsForSelectedDate(e.target.value);
  };

  const checkForOverlappingEvents = async (newEvent) => {
    const { date, startTime, endTime, location, latitude, longitude } =
      newEvent;
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const querySnapshot = await getDocs(
      query(
        collection(db, "meetings"),
        where("date", "==", date),
        where("latitude", "==", latitude || null),
        where("longitude", "==", longitude || null)
      )
    );

    const overlappingEvents = querySnapshot.docs.some((doc) => {
      const event = doc.data();
      const eventStartDateTime = new Date(`${event.date}T${event.startTime}`);
      const eventEndDateTime = new Date(`${event.date}T${event.endTime}`);

      return (
        (startDateTime >= eventStartDateTime &&
          startDateTime < eventEndDateTime) ||
        (endDateTime > eventStartDateTime && endDateTime <= eventEndDateTime) ||
        (startDateTime <= eventStartDateTime && endDateTime >= eventEndDateTime)
      );
    });

    return overlappingEvents;
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      setPreviewUrl(URL.createObjectURL(event.target.files[0]));
    }
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!eventName.trim()) {
      errors.eventName = "Event name is required";
    }
    if (!eventDate.trim()) {
      errors.eventDate = "Event date is required";
    } else {
      const eventDateObj = new Date(eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDateObj < today) {
        errors.eventDate = "Event date cannot be in the past";
      }
    }
    if (!eventStartTime.trim()) {
      errors.eventStartTime = "Event start time is required";
    }
    if (!eventEndTime.trim()) {
      errors.eventEndTime = "Event end time is required";
    }
    if (!location.trim()) {
      errors.location = "Location is required";
    }
    if (!description.trim()) {
      errors.description = "Description is required";
    }
    if (!organizer.trim()) {
      errors.organizer = "Organizer/Contact is required";
    }
    if (!category) {
      errors.category = "Category is required";
    }
    if (!department) {
      errors.department = "Department is required";
    }
    if (!rsvpLink.trim()) {
      errors.rsvpLink = "RSVP/Registration Link is required";
    }
    if (!cost.trim()) {
      errors.cost = "Cost is required";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const handleLocationChange = async (e) => {
      const inputValue = e.target.value;
      setLocation(inputValue);

      if (locationType === "off-campus") {
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              inputValue
            )}&format=json`
          );

          setLocationSuggestions(
            response.data.map((result) => result.display_name)
          );
        } catch (error) {
          console.error("Error fetching location suggestions:", error);
          setLocationSuggestions([]);
        }
      }
    };

    const handleLocationSuggestionClick = async (suggestion) => {
      setLocation(suggestion);
      setLocationSuggestions([]);

      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            suggestion
          )}&format=json&limit=1`
        );

        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          handleMapMarker(lat, lon);
        }
      } catch (error) {
        console.error("Error fetching location coordinates:", error);
      }
    };

    const newMeeting = {
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
      creatorID: currentUserId,
    };

    try {
      const storage = getStorage();
      const imagesRef = ref(storage, `images/${selectedImage.name}`);
      const snapshot = await uploadBytes(imagesRef, selectedImage);
      const imageUrl = await getDownloadURL(snapshot.ref);
      newMeeting.imageUrl = imageUrl;

      if (locationType === "in-campus") {
        switch (location) {
          case "Main Court":
            newMeeting.latitude = 14.80114618770356;
            newMeeting.longitude = 120.92159439914742;
            break;
          case "Sapientia Building":
            newMeeting.latitude = 14.802052021477655;
            newMeeting.longitude = 120.92138387564394;
            break;
          case "Elementary Court":
            newMeeting.latitude = 14.799704034616287;
            newMeeting.longitude = 120.92779066343971;
            break;
          default:
            newMeeting.latitude = 14.80114618770356;
            newMeeting.longitude = 120.92159439914742;
        }
      } else {
        newMeeting.latitude = markedLocation?.lat;
        newMeeting.longitude = markedLocation?.lng;
      }

      const overlappingEvents = await checkForOverlappingEvents(newMeeting);

      if (overlappingEvents) {
        setErrors({
          general:
            "There is an overlapping event at the same location and time",
        });
        return;
      }

      const docRef = await addDoc(collection(db, "meetings"), newMeeting);

      const newActivityEntry = {
        eventType: "event_created",
        eventId: docRef.id,
        timestamp: Date.now(),
        username: "Admin",
        eventName: eventName,
        department: department,
      };
      await addDoc(collection(db, "activityFeed"), newActivityEntry);

      console.log("Meeting added with ID:", docRef.id);
      window.location.href = "/calendar";
    } catch (error) {
      console.error("Error adding meeting:", error);
    }
  };

  const handleLocationChange = async (e) => {
    const inputValue = e.target.value;
    setLocation(inputValue);

    if (locationType === "off-campus") {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            inputValue
          )}&format=json`
        );

        setLocationSuggestions(
          response.data.map((result) => result.display_name)
        );
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setLocationSuggestions([]);
      }
    }
  };

  const handleLocationSuggestionClick = async (suggestion) => {
    setLocation(suggestion);
    setLocationSuggestions([]);

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          suggestion
        )}&format=json&limit=1`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        handleMapMarker(lat, lon);
      }
    } catch (error) {
      console.error("Error fetching location coordinates:", error);
    }
  };

  return (
    <>
      <Layout>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSubmit}>
              <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                  <h2 className="text-base font-semibold leading-7 text-gray-900">
                    Create a New Event
                  </h2>
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="eventname"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Event Name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-2 relative">
                        <input
                          type="text"
                          name="eventname"
                          id="eventname"
                          value={eventName}
                          onChange={handleInputChange}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.eventName
                              ? "ring-red-300 focus:ring-red-500"
                              : "ring-gray-300 focus:ring-indigo-600"
                          } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                        />
                        {showSuggestions && (
                          <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1">
                            {suggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                        {errors.eventName && (
                          <div className="mt-2 text-sm text-red-600">
                            {errors.eventName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="eventdate"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Event Date <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="date"
                          name="eventdate"
                          id="eventdate"
                          value={eventDate}
                          onChange={handleDateChange}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.eventDate
                              ? "ring-red-300 focus:ring-red-500"
                              : "ring-gray-300 focus:ring-indigo-600"
                          } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                        />
                        {errors.eventDate && (
                          <div className="mt-2 text-sm text-red-600">
                            {errors.eventDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      {eventsForSelectedDate.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            In-Campus Events for Selected Date
                          </h3>
                          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {eventsForSelectedDate.map((event) => (
                              <div
                                key={event.name}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                              >
                                <div className="px-4 py-5 sm:p-6">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-base font-semibold text-gray-900 truncate">
                                      {event.name}
                                    </h4>
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {event.category}
                                    </span>
                                  </div>
                                  <div className="mt-2">
                                    <p className="flex items-center text-sm text-gray-500">
                                      <UserCircleIcon
                                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                      />
                                      {event.organizer}
                                    </p>
                                    <p className="mt-2 flex items-center text-sm text-gray-500">
                                      <MapPinIcon
                                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                      />
                                      {event.location}
                                    </p>
                                    <p className="mt-2 flex items-center text-sm text-gray-500">
                                      <ClockIcon
                                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                      />
                                      {event.startTime} - {event.endTime}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="eventstarttime"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Event Start Time <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="time"
                          name="eventstarttime"
                          id="eventstarttime"
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.eventStartTime
                              ? "ring-red-300 focus:ring-red-500"
                              : "ring-gray-300 focus:ring-indigo-600"
                          } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                        />
                        {errors.eventStartTime && (
                          <div className="mt-2 text-sm text-red-600">
                            {errors.eventStartTime}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="eventendtime"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Event End Time <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="time"
                          name="eventendtime"
                          id="eventendtime"
                          value={eventEndTime}
                          onChange={(e) => setEventEndTime(e.target.value)}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.eventEndTime
                              ? "ring-red-300 focus:ring-red-500"
                              : "ring-gray-300 focus:ring-indigo-600"
                          } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                        />
                        {errors.eventEndTime && (
                          <div className="mt-2 text-sm text-red-600">
                            {errors.eventEndTime}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <div>
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          {locationType === "in-campus" ? "Venue" : "Location"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                          {locationType === "in-campus" ? (
                            <>
                              <select
                                id="location"
                                name="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className={`block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ${
                                  errors.location
                                    ? "ring-red-300 focus:ring-red-500"
                                    : "ring-gray-300 focus:ring-indigo-600"
                                } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                              >
                                <option value="">Select a Location</option>
                                {inCampusLocations.map((location) => (
                                  <option key={location} value={location}>
                                    {location}
                                  </option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <>
                              <input
                                type="text"
                                name="location"
                                id="location"
                                ref={locationInputRef}
                                value={location}
                                onChange={handleLocationChange}
                                className={`block w-full rounded-md border-0 py-1.5 pr-20 text-gray-900 ring-1 ring-inset ${
                                  errors.location
                                    ? "ring-red-300 focus:ring-red-500"
                                    : "ring-gray-300 focus:ring-indigo-600"
                                } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                                placeholder="Enter a location"
                              />
                              {locationSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1">
                                  {locationSuggestions.map(
                                    (suggestion, index) => (
                                      <div
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                        onClick={() =>
                                          handleLocationSuggestionClick(
                                            suggestion
                                          )
                                        }
                                      >
                                        {suggestion}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          {errors.location && (
                            <div className="mt-2 text-sm text-red-600">
                              {errors.location}
                            </div>
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
                      <div className="mt-2">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => setShowLocationModal(true)}
                        >
                          Add Location
                        </button>
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
                        Description <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.description
                              ? "ring-red-300 focus:ring-red-500"
                              : "ring-gray-300 focus:ring-indigo-600"
                          } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                        />
                        {errors.description && (
                          <div className="mt-2 text-sm text-red-600">
                            {errors.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="organizer"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Organizer/Contact{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="organizer"
                          id="organizer"
                          value={organizer}
                          onChange={(e) => setOrganizer(e.target.value)}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.organizer
                              ? "ring-red-300 focus:ring-red-500"
                              : "ring-gray-300 focus:ring-indigo-600"
                          } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                        />
                        {errors.organizer && (
                          <div className="mt-2 text-sm text-red-600">
                            {errors.organizer}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-2">
                        <select
                          id="category"
                          name="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.category
                              ? "ring-red-300 focus:ring-red-500"
                              : "ring-gray-300 focus:ring-indigo-600"
                          } sm:text-sm sm:leading-6`}
                        >
                          <option value="">Select a Category</option>
                          <option value="lecture">Lecture</option>
                          <option value="workshop">Workshop</option>
                          <option value="social">Social</option>
                        </select>
                        {errors.category && (
                          <div className="mt-2 text-sm text-red-600">
                            {errors.category}
                          </div>
                        )}
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
                          value={cost || "0"} // Set the default value to 0
                          onChange={(e) => setCost(e.target.value)}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.cost
                              ? "ring-red-300 focus:ring-red-500"
                              : "ring-gray-300 focus:ring-indigo-600"
                          } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                        />
                        {errors.cost && (
                          <div className="mt-2 text-sm text-red-600">
                            {errors.cost}
                          </div>
                        )}
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
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.rsvpLink
                              ? "ring-red-300 focus:ring-red-500"
                              : "ring-gray-300 focus:ring-indigo-600"
                          } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                        />
                        {errors.rsvpLink && (
                          <div className="mt-2 text-sm text-red-600">
                            {errors.rsvpLink}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-6">
                      <div>
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Department <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                          <select
                            id="location"
                            name="location"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className={`block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ${
                              errors.department
                                ? "ring-red-300 focus:ring-red-500"
                                : "ring-gray -300 focus:ring-indigo-600"
                            } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                          >
                            <option value="">Select department</option>
                            <option value="All" key="All">
                              All departments
                            </option>
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
                          {errors.department && (
                            <div className="mt-2 text-sm text-red-600">
                              {errors.department}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-full">
                      <label
                        htmlFor="photo"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Photo
                      </label>
                      <div className="mt-2 flex flex-col items-center gap-x-3">
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="mb-4 h-64 w-full object-contain"
                          />
                        )}
                        <div className="flex items-center gap-x-3">
                          <button
                            type="button"
                            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            onClick={() => fileInputRef.current.click()}
                          >
                            Change
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {errors.general && (
                  <div className="mt-2 text-sm text-red-600">
                    {errors.general}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button
                    type="button"
                    className="text-sm font-semibold leading-6 text-gray-900"
                    onClick={() => (window.location.href = "/calendar")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Save
                  </button>
                </div>
              </div>
              {showLocationModal && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                  <div className="flex min-h-screen items-center justify-center px-4 text-center">
                    <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                      <div className="mt-2">
                        <input
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="Enter new location"
                        />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                          onClick={handleAddLocation}
                        >
                          Add Location
                        </button>
                        <button
                          type="button"
                          className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                          onClick={() => setShowLocationModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
