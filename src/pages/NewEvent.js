import React from "react";
import Layout from "./Layout";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { Fragment, useState, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";

export default function NewEvent({}) {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [rsvpLink, setRsvpLink] = useState("");
  const [cost, setCost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null); // Create a ref for file input

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  // Image Change Handler
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const [locationType, setLocationType] = useState("in-campus");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newMeeting = {
      name: eventName,
      date: eventDate,
      time: eventTime,
      location: location,
      description: description,
      organizer: organizer,
      category: category,
      department: department,
      rsvpLink: rsvpLink,
      cost: cost,
    };

    try {
      // Firebase Storage Upload
      const storage = getStorage();
      const imagesRef = ref(storage, `images/${selectedImage.name}`);
      const snapshot = await uploadBytes(imagesRef, selectedImage);
      const imageUrl = await getDownloadURL(snapshot.ref);
      newMeeting.imageUrl = imageUrl;

      // Add to Firestore
      const docRef = await addDoc(collection(db, "meetings"), newMeeting);

      // Add to Activity Feed
      const newActivityEntry = {
        eventType: "event_created",
        eventId: docRef.id,
        timestamp: Date.now(),
        username: "Admin",
        eventName: eventName,
      };
      await addDoc(collection(db, "activityFeed"), newActivityEntry);

      console.log("Meeting added with ID:", docRef.id);
      window.location.href = "/calendar";
    } catch (error) {
      console.error("Error adding meeting:", error);
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
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-6">
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

                    <div className="sm:col-span-4">
                      {" "}
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

                    <div className="sm:col-span-2">
                      {" "}
                      <label
                        htmlFor="eventtime"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Event Time
                      </label>
                      <div className="mt-2">
                        <input
                          type="time"
                          name="eventtime"
                          id="eventtime"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      {/* <label
                        htmlFor="location"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Location
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="location"
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div> */}
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
                              onChange={(e) => setLocationType(e.target.value)}
                              className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                            >
                              <option value="in-campus">in-campus</option>
                              <option value="off-campus">off-campus</option>
                            </select>
                          </div>
                        </div>
                      </div>
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
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300  focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                    <div className="col-span-full">
                      <label
                        htmlFor="photo"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Photo
                      </label>
                      <div className="mt-2 flex items-center gap-x-3">
                        <UserCircleIcon
                          className="h-12 w-12 text-gray-300"
                          aria-hidden="true"
                        />
                        <button
                          type="button"
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          onClick={() => fileInputRef.current.click()} // Trigger file input
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

                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button
                    type="button"
                    className="text-sm font-semibold leading-6 text-gray-900"
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
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
