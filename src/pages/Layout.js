import React from "react";
import { NavLink } from "react-router-dom";
import { signOut, getAuth, onAuthStateChanged } from "firebase/auth";
import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  StudentIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    current: window.location.pathname === "/dashboard",
    path: "/dashboard",
  },
  {
    name: "Students",
    href: "/computer-studies",
    icon: UsersIcon,
    current: window.location.pathname === "/computer-studies",
    path: "/computer-studies",
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarIcon,
    current: window.location.pathname === "/calendar",
    path: "/calendar",
  },
];

const teams = [
  { id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
  { id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
  { id: 3, name: "Workcation", href: "#", initial: "W", current: false },
];

function classNames(...classes) {
  const currentPath = window.location.pathname;
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (cls.includes("bg-gray-800")) {
        const navItem = navigation.find((item) => item.path === currentPath);
        if (navItem) {
          return cls.replace(
            "bg-gray-800",
            "bg-gray-800 transition-colors duration-500"
          );
        }
      }
      return cls;
    })
    .join(" ");
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isNotStudentsPage = !(
    window.location.pathname === "/computer-studies" ||
    window.location.pathname === "/" ||
    window.location.pathname === "/education" ||
    window.location.pathname === "/accountancy" ||
    window.location.pathname === "/business-administration" ||
    window.location.pathname === "/arts-and-sciences" ||
    window.location.pathname === "/maritime" ||
    window.location.pathname === "/health-sciences" ||
    window.location.pathname === "/hospitality" ||
    window.location.pathname === "/reports#" ||
    window.location.pathname === "/dashboard" ||
    window.location.pathname === "/reports" ||
    window.location.pathname.startsWith("/student/")
  );

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setFullName(userDocSnap.data().fullName);
            setUserRole(userDocSnap.data().role);
          } else {
            console.log("User document not found");
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      } else {
        setFullName("");
        setUserRole("");
      }
    });

    return unsubscribe;
  }, [auth, db]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const isAdmin = userRole?.toLowerCase() === "admin";
  const isOSAS = userRole?.toLowerCase() === "osas";

  const isReportsVisible = isAdmin || isOSAS;

  const userNavigation = [
    ...(isAdmin
      ? [
          { name: "Add New User", href: "/register" },
          { name: "View Evaluation Forms", href: "/evaluations-view" },
          { name: "User Management", href: "/user-management" },
          { name: "Pending Events", href: "/pending-meetings"}
        ]
      : []),
    { name: "Sign out", href: "#", onClick: handleSignOut },
  ];

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center">
                      <img
                        className="h-10 w-auto"
                        src="https://dyci.edu.ph/img/DYCI.png"
                        alt="DYCI Logo"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <a
                                  href={item.href}
                                  className={classNames(
                                    item.path === window.location.pathname
                                      ? "bg-gray-800 text-white"
                                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <item.icon
                                    className="h-6 w-6 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        {/* <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400">Your teams</div>
                            <ul role="list" className="-mx-2 mt-2 space-y-1">
                              {teams.map((team) => (
                                <li key={team.name}>
                                  <a
                                    href={team.href}
                                    className={classNames(
                                      team.current
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                    )}
                                  >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                      {team.initial}
                                    </span>
                                    <span className="truncate">{team.name}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </li> */}
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img
                className="h-10 w-auto"
                src="https://dyci.edu.ph/img/DYCI.png"
                alt="DYCI Logo"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.path === window.location.pathname
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:text-white hover:bg-gray-800",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <item.icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                    {isReportsVisible && (
                      <li key="Reports">
                        <Menu as="div" className="relative">
                          <Menu.Button className="flex w-full px-3 py-2 text-left text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800 rounded-md group">
                            <ChartPieIcon
                              className="h-6 w-6 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="ml-2">Reports</span>
                            <ChevronDownIcon className="ml-auto h-5 w-5 text-gray-400 group-hover:text-white" />
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
                            <Menu.Items className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <NavLink
                                      to="/student-masterlist"
                                      className={classNames(
                                        active
                                          ? "bg-gray-700 text-white"
                                          : "text-gray-400",
                                        "block px-4 py-2 text-sm"
                                      )}
                                    >
                                      Student Masterlist
                                    </NavLink>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <NavLink
                                      to="/events"
                                      className={classNames(
                                        active
                                          ? "bg-gray-700 text-white"
                                          : "text-gray-400",
                                        "block px-4 py-2 text-sm"
                                      )}
                                    >
                                      Events
                                    </NavLink>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </li>
                    )}
                  </ul>
                </li>
                {/* <li>
                    <div className="text-xs font-semibold leading-6 text-gray-400">Your teams</div>
                    <ul role="list" className="-mx-2 mt-2 space-y-1">
                      {teams.map((team) => (
                        <li key={team.name}>
                          <a
                            href={team.href}
                            className={classNames(
                              team.current
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                            )}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                              {team.initial}
                            </span>
                            <span className="truncate">{team.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li> */}
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div
              className="h-6 w-px bg-gray-900/10 lg:hidden"
              aria-hidden="true"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form className="relative flex flex-1" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only"></label>
                <div className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm" />
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Separator */}
                <div
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
                  aria-hidden="true"
                />

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <div className="bg-indigo-500 rounded-full h-8 w-8 flex items-center justify-center text-white text-base font-bold mr-2">
                      {fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:flex md:items-center">
                      <span
                        className="ml-2 text-sm font-semibold leading-6 text-gray-900"
                        aria-hidden="true"
                      >
                        {fullName}
                      </span>
                      <ChevronDownIcon
                        className="ml-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
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
                    <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              className={classNames(
                                active ? "bg-gray-50" : "",
                                "block px-3 py-1 text-sm leading-6 text-gray-900"
                              )}
                              onClick={item.onClick}
                            >
                              {item.name}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <main className={isNotStudentsPage ? "py-10" : ""}>
            <div className={isNotStudentsPage ? "px-4 sm:px-6 lg:px-8" : ""}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
