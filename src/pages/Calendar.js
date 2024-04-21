import Layout from "./Layout";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
} from "@heroicons/react/20/solid";
import { Menu, Transition, Dialog } from "@headlessui/react";
import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  LinkIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import { db } from "../firebaseConfig";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAuth } from "./components/AuthContext";

let meetings = [];
const months = [
  { name: "January", days: 31 },
  { name: "February", days: 28 }, // Update for leap years
  { name: "March", days: 31 },
  { name: "April", days: 30 },
  { name: "May", days: 31 },
  { name: "June", days: 30 },
  { name: "July", days: 31 },
  { name: "August", days: 31 },
  { name: "September", days: 30 },
  { name: "October", days: 31 },
  { name: "November", days: 30 },
  { name: "December", days: 31 },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Calendar() {
  const [retrievedMeetings, setRetrievedMeetings] = useState([]);
  const [open, setOpen] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const meetingsCollectionRef = collection(db, "meetings");
    const fetchMeetings = async () => {
      const data = await getDocs(meetingsCollectionRef);
      meetings = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
    };
    fetchMeetings().then(() => {
      setRetrievedMeetings(meetings);
    });
  }, []);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const fetchUserRole = async () => {
          try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setUserRole(userDocSnap.data().role);
            } else {
              setUserRole(null);
            }
          } catch (error) {
            console.error("Error fetching user document:", error);
            setUserRole(null);
          }
        };
        fetchUserRole();
      } else {
        setUserRole(null);
      }
    });

    return unsubscribe;
  }, [auth, db]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const lastDayOfMonth = new Date(
      currentYear,
      currentMonth,
      daysInMonth
    ).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ date: null });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isToday =
        date.getFullYear() === new Date().getFullYear() &&
        date.getMonth() === new Date().getMonth() &&
        date.getDate() === new Date().getDate();

      const isSelected =
        selectedDate &&
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getDate() === selectedDate.getDate();

      const eventsOnDay =
        meetings.filter((meeting) => {
          const meetingDate = new Date(meeting.date);
          return (
            meetingDate.getDate() === date.getDate() &&
            meetingDate.getMonth() === currentMonth &&
            meetingDate.getFullYear() === currentYear
          );
        }) || [];
      const eventsCount = eventsOnDay.length;

      days.push({ date, isToday, isSelected, eventsOnDay, eventsCount });
    }

    for (let i = 1; i <= 6 - lastDayOfMonth; i++) {
      days.push({ date: null });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    setCurrentYear((prevYear) =>
      currentMonth === 0 ? prevYear - 1 : prevYear
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    setCurrentYear((prevYear) =>
      currentMonth === 11 ? prevYear + 1 : prevYear
    );
  };

  const days = generateDays();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortByDate, setSortByDate] = useState("asc"); // "asc" or "desc"

  // Filter events based on search and sort
  const filteredEvents = retrievedMeetings
    .filter((meeting) => {
      if (!selectedDate) return true; // If no date is selected, show all events

      const meetingDate = new Date(meeting.date);
      return (
        meetingDate.getDate() === selectedDate.getDate() &&
        meetingDate.getMonth() === selectedDate.getMonth() &&
        meetingDate.getFullYear() === selectedDate.getFullYear()
      );
    })
    .filter((meeting) =>
      meeting.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortByDate === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

  return (
    <Layout>
      <div>
        <h2 className="text-base font-semibold leading-6 text-gray-900">
          List of events
        </h2>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
          {/* Search Input */}

          <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
            <div className="flex items-center text-gray-900">
              <button
                type="button"
                className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                onClick={handlePrevMonth}
              >
                <span className="sr-only">Previous month</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="flex-auto text-sm font-semibold">
                {months[currentMonth].name} {currentYear}
              </div>
              <button
                type="button"
                className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                onClick={handleNextMonth}
              >
                <span className="sr-only">Next month</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>
            <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
              {days.map((day, dayIdx) => (
                <button
                  key={dayIdx}
                  type="button"
                  className={classNames(
                    "py-1.5 hover:bg-gray-100 focus:z-10 relative", // Add 'relative' class for positioning the events count
                    day.date ? "bg-white" : "bg-gray-50",
                    (day.isSelected || day.isToday) && "font-semibold",
                    day.isSelected && "text-white",
                    !day.isSelected &&
                      day.date &&
                      !day.isToday &&
                      "text-gray-900",
                    !day.isSelected &&
                      !day.date &&
                      !day.isToday &&
                      "text-gray-400",
                    day.isToday && !day.isSelected && "text-indigo-600",
                    dayIdx === 0 && "rounded-tl-lg",
                    dayIdx === 6 && "rounded-tr-lg",
                    dayIdx === days.length - 7 && "rounded-bl-lg",
                    dayIdx === days.length - 1 && "rounded-br-lg"
                  )}
                  onClick={() => {
                    if (
                      selectedDate &&
                      day.date &&
                      day.date.getFullYear() === selectedDate.getFullYear() &&
                      day.date.getMonth() === selectedDate.getMonth() &&
                      day.date.getDate() === selectedDate.getDate()
                    ) {
                      setSelectedDate(null); // Remove filtering if the same date is clicked again
                    } else {
                      setSelectedDate(
                        day.date
                          ? new Date(
                              day.date.getFullYear(),
                              day.date.getMonth(),
                              day.date.getDate()
                            )
                          : null
                      );
                    }
                  }}
                >
                  <time
                    dateTime={day.date ? day.date.toISOString() : null}
                    className={classNames(
                      "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                      day.isSelected && day.isToday && "bg-indigo-600",
                      day.isSelected && !day.isToday && "bg-gray-900"
                    )}
                  >
                    {day.date ? day.date.getDate() : ""}
                  </time>
                  {day.eventsCount > 0 && (
                    <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {day.eventsCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
            {userRole === "admin" || userRole === "osas" ? (
              <Link to="/new-event">
                <button
                  type="button"
                  className="mt-8 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Add event
                </button>
              </Link>
            ) : (
              <p className="pt-4">You do not have permission to add events.</p>
            )}
          </div>
          <ol className="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8">
            <div className="mb-4 lg:col-span-7 xl:col-span-8">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-md px-3 py-2 w-full"
              />
            </div>
            {filteredEvents.map((meeting) => (
              <li
                key={meeting.id}
                className="relative flex space-x-6 py-6 xl:static"
              >
                <img
                  src={meeting.imageUrl}
                  alt=""
                  className="h-14 w-14 flex-none rounded-full"
                />
                <div className="flex-auto">
                  <Link to={`/events/${meeting.id}/attendees`}>
                    <h3 className="pr-10 font-semibold text-gray-900 xl:pr-0">
                      {meeting.name}
                    </h3>
                  </Link>
                  <dl className="mt-2 flex flex-col text-gray-500 xl:flex-row">
                    <div className="flex items-start space-x-3">
                      <dt className="mt-0.5">
                        <span className="sr-only">Date</span>
                        <CalendarIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </dt>
                      <dd>
                        <time dateTime={meeting.datetime}>
                          {meeting.date} at ({meeting.startTime} -{" "}
                          {meeting.endTime})
                        </time>
                      </dd>
                    </div>
                    <div className="mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5">
                      <dt className="mt-0.5">
                        <span className="sr-only">Location</span>
                        <MapPinIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </dt>
                      <dd>{meeting.location}</dd>
                    </div>
                  </dl>
                </div>
                <Menu
                  as="div"
                  className="absolute right-0 top-6 xl:relative xl:right-auto xl:top-auto xl:self-center"
                >
                  <div>
                    <Menu.Button className="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                      <span className="sr-only">Open options</span>
                      <EllipsisHorizontalIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {(userRole === "admin" ||
                          (meeting.creatorId &&
                            currentUserId === meeting.creatorId)) && (
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href={`/events/${meeting.id}/edit`}
                                className={classNames(
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700",
                                  "block px-4 py-2 text-sm"
                                )}
                              >
                                Edit
                              </a>
                            )}
                          </Menu.Item>
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Layout>
  );
}
