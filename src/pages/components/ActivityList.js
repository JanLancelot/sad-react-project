import React from "react";
import { useNavigate } from "react-router-dom";
import StudentTableBody from "./StudentTableBody";

export default function ActivityList({students, meetingCount, department}){
    const navigate = useNavigate();

    const handleSignupClick = () => {
        navigate('/signup-student');
    };

    return(
        <div className="border-t border-gray-200 pt-11">
          <h2 className="px-4 text-base font-semibold leading-7 text-gray-900 sm:px-6 lg:px-8">
            List of Students
          </h2>
          <table className="mt-6 w-full whitespace-nowrap text-left">
            <colgroup>
              <col className="w-full sm:w-4/12" />
              <col className="lg:w-4/12" />
              <col className="lg:w-2/12" />
              <col className="lg:w-1/12" />
              <col className="lg:w-1/12" />
            </colgroup>
            <thead className="border-b border-gray-200 text-sm leading-6 text-gray-900">
              <tr>
                <th
                  scope="col"
                  className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
                >
                  Student name
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
                >
                  Student Number
                </th>
                <th
                  scope="col"
                  className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
                >
                  Requirements
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
                >
                  Events attended
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
                >
                  Attendance rate
                </th>
              </tr>
            </thead>
            <StudentTableBody students={students} meetingCount={meetingCount} department={department}/>
          </table>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSignupClick}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign Up Student
            </button>
          </div>
        </div>
    );
}