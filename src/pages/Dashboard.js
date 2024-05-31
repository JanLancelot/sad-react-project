import Layout from "./Layout";
import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  Bars3Icon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import React, { useEffect } from "react";
import { db } from "../firebaseConfig";

const navigation = [
  { name: "Projects", href: "#", icon: FolderIcon, current: false },
  { name: "Deployments", href: "#", icon: ServerIcon, current: true },
  { name: "Activity", href: "#", icon: SignalIcon, current: false },
  { name: "Domains", href: "#", icon: GlobeAltIcon, current: false },
  { name: "Usage", href: "#", icon: ChartBarSquareIcon, current: false },
  { name: "Settings", href: "#", icon: Cog6ToothIcon, current: false },
];
const statuses = {
  offline: "text-gray-500 bg-gray-100/10",
  online: "text-green-400 bg-green-400/10",
  error: "text-rose-400 bg-rose-400/10",
};
const environments = {
  Preview: "text-gray-400 bg-gray-400/10 ring-gray-400/20",
  Production: "text-indigo-400 bg-indigo-400/10 ring-indigo-400/30",
};
let meetings = [];
const deployments = [
  {
    id: 1,
    href: "#",
    projectName: "CS Department",
    teamName: "IRCITE",
    status: "offline",
    statusText: "Initiated 1m 32s ago",
    description: "Deploys from GitHub",
    environment: "Preview",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const [retrievedMeetings, setRetrievedMeetings] = useState([]);
  const [todaysEvents, setTodaysEvents] = useState([]);
  const [activityItems, setActivityItems] = useState([]);

  const fetchActivityFeed = async () => {
    const activityFeedRef = collection(db, "activityFeed");
    const q = query(activityFeedRef, orderBy("timestamp", "desc"));

    const data = await getDocs(q);
    const activityItems = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    console.log(activityItems);
    setActivityItems(activityItems);
  };

  useEffect(() => {
    const meetingsCollectionRef = collection(db, "meetings");

    const calculateNextWeekRange = () => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(startOfWeek.getDate() + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      endOfWeek.setHours(23, 59, 59, 999);

      return { startOfWeek, endOfWeek };
    };

    const fetchMeetings = async () => {
      const { startOfWeek, endOfWeek } = calculateNextWeekRange();

      const nextWeekQuery = query(
        meetingsCollectionRef,
        where("date", ">=", startOfWeek.toISOString()),
        where("date", "<=", endOfWeek.toISOString())
      );

      const currentDayQuery = query(
        meetingsCollectionRef,
        where("date", "==", new Date().toISOString().split("T")[0])
      );

      const [nextWeekData, currentDayData] = await Promise.all([
        getDocs(nextWeekQuery),
        getDocs(currentDayQuery),
      ]);

      const nextWeekMeetings = nextWeekData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const currentDayMeetings = currentDayData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      meetings = [...nextWeekMeetings, ...currentDayMeetings];
      setRetrievedMeetings(meetings);
      setTodaysEvents(currentDayMeetings);
    };

    fetchActivityFeed();
    fetchMeetings();
  }, []);

  function convertTo12Hour(time) {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const period = +hours < 12 ? "AM" : "PM";
    const hour = +hours % 12 || 12;
    return `${hour}:${minutes} ${period}`;
  }

  return (
    <Layout>
      <main className="lg:pr-96">
        <header className="flex items-center justify-between border-b border-gray-300 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-base font-semibold leading-7 text-gray-800">
            Dashboard
          </h1>
        </header>
  
        {/* Content area */}
        <div className="lg:grid lg:grid-cols-12"> {/* Adjusted gap-x-16 to gap-x-6 */}
          {/* Left column */}
          <div className="lg:col-span-8">
            {/* Events of the Day Section */}
            <section
              aria-labelledby="events-of-the-day-title"
              className="mt-8 xl:mt-10"
            >
              <div className="px-4 sm:px-6 lg:px-8">
                <h2
                  id="events-of-the-day-title"
                  className="text-base font-semibold leading-7 text-gray-900"
                >
                  Events of the Day
                </h2>
                {todaysEvents.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500">
                    No events scheduled for today.
                  </p>
                ) : (
                  <ul role="list" className="mt-6 grid grid-cols-1 gap-6">
                    {todaysEvents.map((event) => (
                      <li
                        key={event.id}
                        className="col-span-1 rounded-lg bg-white shadow-sm"
                      >
                        <a href="#" className="block">
                          <img
                            src={
                              event.imageUrl ||
                              "https://via.placeholder.com/320x180"
                            }
                            alt={event.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="flex items-center px-4 py-5 space-x-3">
                            <CalendarIcon
                              className="h-6 w-6 text-gray-400"
                              aria-hidden="true"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {event.name}
                              </p>
                              <p className="mt-1 text-xs font-medium text-gray-500">
                                {convertTo12Hour(event.startTime)} -{" "}
                                {convertTo12Hour(event.endTime)}
                              </p>
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
  
            {/* Upcoming Events Section */}
            <section
              aria-labelledby="upcoming-events-title"
              className="mt-8 xl:mt-10"
            >
              <div className="px-4 sm:px-6 lg:px-8">
                <h2
                  id="upcoming-events-title"
                  className="text-base font-semibold leading-7 text-gray-900"
                >
                  Upcoming Events
                </h2>
                <ol className="mt-6 divide-y divide-gray-100 text-sm leading-6 lg:col-span-8 xl:col-span-8"> {/* Adjusted column spans */}
                  {retrievedMeetings.map((meeting) => (
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
                        <h3 className="pr-10 font-semibold text-gray-900 xl:pr-0">
                          {meeting.name}
                        </h3>
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
                                {meeting.date} at{" "}
                                {convertTo12Hour(meeting.startTime)} -{" "}
                                {convertTo12Hour(meeting.endTime)}
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
                              <Menu.Item>
                                {({ active }) => (
                                  <a
                                    href="#"
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
                              <Menu.Item>
                                {({ active }) => (
                                  <a
                                    href="#"
                                    className={classNames(
                                      active
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-700",
                                      "block px-4 py-2 text-sm"
                                    )}
                                  >
                                    Cancel
                                  </a>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </div>
  
          {/* Right column */}
          <aside className="bg-white lg:fixed lg:bottom-0 lg:right-0 lg:top-16 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-gray-300">
            <header className="flex items-center justify-between border-b border-gray-300 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h2 className="text-base font-semibold leading-7 text-gray-800">
                Activity feed
              </h2>
            </header>
            <ul role="list" className="divide-y divide-gray-300">
              {activityItems.map((item) => (
                <li key={item.id} className="px-4 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-x-3">
                    <div className="bg-indigo-500 rounded-full h-8 w-8 flex items-center justify-center text-white text-base font-bold mr-2">
                      {item.username?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="flex-auto truncate text-sm font-semibold leading-6 text-gray-800">
                      {item.username}
                    </h3>
                    <time
                      dateTime={new Date(item.timestamp).toISOString()}
                      className="flex-none text-xs text-gray-600"
                    >
                      {new Date(item.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-3 truncate text-sm text-gray-500">
                    {item.eventType === "event_created" && (
                      <>
                        Created a new event:{" "}
                        <span className="font-medium">{item.eventName}</span>
                      </>
                    )}
                    {item.eventType === "event_updated" && (
                      <>
                        Updated the event:{" "}
                        <span className="font-medium">{item.eventName}</span>
                      </>
                    )}
                    {item.eventType === "event_deleted" && (
                      <>
                        Deleted the event:{" "}
                        <span className="font-medium">{item.eventName}</span>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </Layout>
  );  
}
