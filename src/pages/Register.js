import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  FaLock,
  FaUserGraduate,
  FaUserShield,
  FaUserTie,
  FaUserTag,
  FaClipboard,
} from "react-icons/fa";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const navigate = useNavigate();

  const roles = [
    { name: "Admin", icon: FaUserShield },
    { name: "OSAS", icon: FaUserTie },
    { name: "SSC", icon: FaUserGraduate },
    { name: "College Dean", icon: FaUserTag },
  ];

  const departments = [
    "Computer Studies",
    "Education",
    "Accountancy",
    "Business Administration",
    "Arts and Sciences",
    "Maritime",
    "Health Sciences",
    "Hospitality Management and Tourism",
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
  
    try {
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
  
      const db = getFirestore();
      const userRole = role === "College Dean" ? "College Dean" : role;
      const userData = {
        fullName,
        email,
        role: userRole,
        ...(role === "College Dean" && { department }),
      };
      await setDoc(doc(db, "users", user.uid), userData);
  
      // Update state with the created user information
      setCreatedUser(userData);
      setIsRegistered(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const copyUserInfo = () => {
    const userInfo = `Full Name: ${createdUser.fullName}\nEmail: ${
      createdUser.email
    }\nRole: ${createdUser.role}\n${
      createdUser.department ? `Department: ${createdUser.department}` : ""
    }`;
    navigator.clipboard.writeText(userInfo);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-24 w-auto"
            src="https://dyci.edu.ph/img/DYCI.png"
            alt="DYCI LOGO"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Register
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        {isRegistered ? (
          <div>
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p>User registered successfully!</p>
            </div>
            <div className="mb-4 p-4 border rounded-md">
              <p className="mb-2">
                <strong>Full Name:</strong> {createdUser.fullName}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {createdUser.email}
              </p>
              <p className="mb-2">
                <strong>Role:</strong> {createdUser.role}
              </p>
              {createdUser.department && (
                <p>
                  <strong>Department:</strong> {createdUser.department}
                </p>
              )}
              <button
                className="flex items-center mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded focus:outline-none focus:shadow-outline"
                onClick={copyUserInfo}
              >
                <FaClipboard className="mr-2" /> Copy User Info
              </button>
            </div>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded focus:outline-none focus:shadow-outline"
                onClick={() => {
                  setFullName("");
                  setEmail("");
                  setPassword("");
                  setRole("Admin");
                  setDepartment("");
                  setError(null);
                  setIsRegistered(false);
                  setCreatedUser(null);
                }}
              >
                Register Another User
              </button>
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded focus:outline-none focus:shadow-outline"
                onClick={() => navigate("/")}
              >
                Go to Home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="mb-6">
              <label
                htmlFor="fullName"
                className="block text-gray-700 font-bold mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-bold mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 font-bold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="role"
                className="block text-gray-700 font-bold mb-2"
              >
                Role
              </label>
              <Listbox value={role} onChange={setRole}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="flex items-center">
                      {roles.find((r) => r.name === role).icon()}
                      <span className="ml-3 block truncate">{role}</span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={React.Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {roles.map((r, idx) => (
                        <Listbox.Option
                          key={idx}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-amber-100 text-amber-900"
                                : "text-gray-900"
                            }`
                          }
                          value={r.name}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                <span className="mr-2">{r.icon()}</span>
                                {r.name}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            {(role === "SSC" || role === "College Dean") && (
              <div className="mb-6">
                <label
                  htmlFor="department"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Department
                </label>
                <Listbox value={department} onChange={setDepartment}>
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                      <span className="block truncate">
                        {department || "Select Department"}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <div>
                      <Transition
                        as={React.Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {departments.map((dept, idx) => (
                            <Listbox.Option
                              key={idx}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? "bg-amber-100 text-amber-900"
                                    : "text-gray-900"
                                }`
                              }
                              value={dept}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {dept}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </div>
                </Listbox>
              </div>
            )}
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Register
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
