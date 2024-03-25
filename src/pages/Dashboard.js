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
// const teams = [
//   { id: 1, name: 'Planetaria', href: '#', initial: 'P', current: false },
//   { id: 2, name: 'Protocol', href: '#', initial: 'P', current: false },
//   { id: 3, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
// ]
const statuses = {
  offline: "text-gray-500 bg-gray-100/10",
  online: "text-green-400 bg-green-400/10",
  error: "text-rose-400 bg-rose-400/10",
};
const environments = {
  Preview: "text-gray-400 bg-gray-400/10 ring-gray-400/20",
  Production: "text-indigo-400 bg-indigo-400/10 ring-indigo-400/30",
};
let meetings = [
];
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
  const [activityItems, setActivityItems] = useState([]);


  const fetchActivityFeed = async () => {
    const activityFeedRef = collection(db, "activityFeed");
    const q = query(activityFeedRef, orderBy("timestamp", "desc")); // Order by newest
    // Limit the number of entries fetched (soon)

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
      startOfWeek.setDate(startOfWeek.getDate() + 1); // Start on the next day
      startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      endOfWeek.setHours(23, 59, 59, 999); // End of the last day

      return { startOfWeek, endOfWeek };
    };

    const fetchMeetings = async () => {
      const { startOfWeek, endOfWeek } = calculateNextWeekRange();

      const q = query(
        meetingsCollectionRef,
        where("date", ">=", startOfWeek.toISOString()),
        where("date", "<=", endOfWeek.toISOString())
      );

      const data = await getDocs(q);
      meetings = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    };

    fetchActivityFeed();
    fetchMeetings().then(() => {
      setRetrievedMeetings(meetings);
    });
  }, []);

  return (
    <Layout>
      <main className="lg:pr-96">
        <header className="flex items-center justify-between border-b border-gray-300 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-base font-semibold leading-7 text-gray-800">
            Upcoming Events
          </h1>

          {/* Sort dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-x-1 text-sm font-medium leading-6 text-gray-800">
              Sort by
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-300 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-50" : "",
                        "block px-3 py-1 text-sm leading-6 text-gray-900"
                      )}
                    >
                      Name
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-50" : "",
                        "block px-3 py-1 text-sm leading-6 text-gray-900"
                      )}
                    >
                      Date updated
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-50" : "",
                        "block px-3 py-1 text-sm leading-6 text-gray-900"
                      )}
                    >
                      Environment
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </header>

        <main className="">
          <div className="">
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
              {/* mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 */}
              <ol className="divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-">
                {meetings.map((meeting) => (
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
                              {meeting.date} at {meeting.time}
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
          </div>
        </main>

        {/* Deployment list */}
      </main>

      {/* Activity feed */}
      <aside className="bg-white lg:fixed lg:bottom-0 lg:right-0 lg:top-16 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-gray-300">
        <header className="flex items-center justify-between border-b border-gray-300 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h2 className="text-base font-semibold leading-7 text-gray-800">
            Activity feed
          </h2>
          <a
            href="#"
            className="text-sm font-semibold leading-6 text-indigo-400"
          >
            View all
          </a>
        </header>
        <ul role="list" className="divide-y divide-gray-300">
          {activityItems.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-x-3">
                <img
                  src={item.userImageUrl || "/default-profile.png"} // Default if no image
                  alt=""
                  className="h-6 w-6 flex-none rounded-full bg-gray-800"
                />
                <h3 className="flex-auto truncate text-sm font-semibold leading-6 text-gray-800">
                  {item.username}
                </h3>
                <time
                  dateTime={new Date(item.timestamp).toISOString()} // Format from timestamp
                  className="flex-none text-xs text-gray-600"
                >
                  {new Date(item.timestamp).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-3 truncate text-sm text-gray-500">
                {item.eventType === "event_created" && ( // Check event type
                  <>
                    Created a new event:{" "}
                    <span className="font-medium">{item.eventName}</span>
                  </>
                )}
                {/* Add logic for other event types*/}
              </p>
            </li>
          ))}
        </ul>
      </aside>
    </Layout>
  );
}
