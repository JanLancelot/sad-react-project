import React from "react";
const classNames = (...classes) => classes.filter(Boolean).join(" ");

const DepartmentHeader = ({ departmentName, course, dean, stats, secondaryNavigation }) => {
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
              <span className="text-gray-600">/</span>
              <span className="font-semibold text-gray-900">{course}</span>
            </h1>
          </div>
          <p className="mt-2 text-xs leading-6 text-gray-600">
            {/* Replace with your department description */}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit...
          </p>
        </div>
        <div className="order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none">
          {dean}
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
    </div>
  );
};

export default DepartmentHeader;
