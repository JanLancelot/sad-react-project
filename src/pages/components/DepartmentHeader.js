import React, { useState, useEffect, Fragment } from "react";
import { db } from "../../firebaseConfig"; // Make sure to configure Firebase
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { CogIcon } from '@heroicons/react/24/outline';

import { Dialog, Transition } from '@headlessui/react';

const classNames = (...classes) => classes.filter(Boolean).join(" ");

const DepartmentHeader = ({ departmentName, department, course, dean, stats, secondaryNavigation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requiredEvents, setRequiredEvents] = useState(0);
  const [docId, setDocId] = useState(null);

  // Function to fetch current requiredEvents from Firestore
  const fetchRequiredEvents = async () => {
    const q = query(collection(db, "department-settings"), where("department", "==", department));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      setRequiredEvents(docData.data().requiredEvents);
      setDocId(docData.id); // Save the document ID for updating later
    } else {
      console.error("No matching documents found!");
    }
  };

  const updateRequiredEvents = async () => {
    if (docId) {
      const docRef = doc(db, "department-settings", docId);
      await updateDoc(docRef, {
        requiredEvents: requiredEvents
      });
      setIsOpen(false); // Close the modal after updating
      window.location.reload(); // Refresh the page
    } else {
      console.error("Document ID is not set!");
    }
  };
  
  // Open modal and fetch data
  const openModal = () => {
    setIsOpen(true);
    fetchRequiredEvents();
  };

  // Close modal
  const closeModal = () => setIsOpen(false);

  return (
    <div>
      <nav className="flex overflow-x-auto border-b border-gray-200 py-4">
        <ul
          role="list"
          className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-600 sm:px-6 lg:px-8"
        >
          {secondaryNavigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={item.current ? "text-indigo-600" : ""}
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-x-3">
            <div className="flex-none rounded-full bg-blue-400/10 p-1 text-blue-400">
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <h1 className="flex gap-x-3 text-base leading-7">
              <span className="font-semibold text-gray-900">
                {departmentName}
              </span>
              <div className="order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none">
                {dean}
              </div>
              <button
                onClick={openModal}
                className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-900"
              >
                <CogIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </h1>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 bg-white sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, statIdx) => (
          <div
            key={stat.name}
            className={classNames(
              statIdx % 2 === 1
                ? "sm:border-l"
                : statIdx === 2
                ? "lg:border-l"
                : "",
              "border-t border-gray-200 py-6 px-4 sm:px-6 lg:px-8"
            )}
          >
            <p className="text-sm font-medium leading-6 text-gray-600">
              {stat.name}
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-gray-900">
                {stat.value}
              </span>
              {stat.unit ? (
                <span className="text-sm text-gray-600">{stat.unit}</span>
              ) : null}
            </p>
          </div>
        ))}
      </div>

      {/* Modal for editing requiredEvents */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Edit Required Events
                  </Dialog.Title>
                  <div className="mt-2">
                    <input
                      type="number"
                      value={requiredEvents}
                      onChange={(e) => setRequiredEvents(Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      onClick={updateRequiredEvents}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default DepartmentHeader;
