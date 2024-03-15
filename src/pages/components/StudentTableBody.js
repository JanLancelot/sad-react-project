import React from "react";

const statuses = {
  Complete: "text-green-400 bg-green-400/10",
  Incomplete: "text-rose-400 bg-rose-400/10",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function StudentTableBody({ students, meetingCount }) {
  return (
    <tbody>
      {students.map(
        (
          student // Assuming 'student' has the data
        ) => (
          <tr key={student.id}>
            {" "}
            <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
              <div className="flex items-center gap-x-4">
                {/* Assuming you don't have student images */}
                <div className="h-8 w-8 rounded-full bg-gray-800"></div>
                <div className="truncate text-sm font-medium leading-6 text-gray-900">
                  {student.fullName} {/* Use your actual field name */}
                </div>
              </div>
            </td>
            <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
              <div className="flex gap-x-3">
                <div className="font-mono text-sm leading-6 text-gray-600">
                  {student.studentID}
                </div>
                {/* <span className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-400/20">
                            {item.branch}
                          </span> */}
              </div>
            </td>
            {/* add a requirements completed? column */}
            {/* <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                      <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                        {student.schoolEmail}
                      </div>
                    </td> */}
            <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
              <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                <div
                  className={classNames(
                    statuses[student.requirements],
                    "flex-none rounded-full p-1"
                  )}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-current" />
                </div>
                <div className="hidden text-gray-900 sm:block">
                  {student.requirements}
                </div>
              </div>
            </td>
            <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-600 md:table-cell lg:pr-20">
              {student.eventsAttended}
            </td>
            <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-600 sm:table-cell sm:pr-6 lg:pr-8">
              {meetingCount === 0
                ? "N/A"
                : ((student.eventsAttended / meetingCount) * 100).toFixed(2) +
                  "%"}
            </td>
          </tr>
        )
      )}
    </tbody>
  );
}
