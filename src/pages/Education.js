import Layout from "./Layout";

const secondaryNavigation = [
  { name: 'Computer Studies', href: '/computer-studies', current: false },
  { name: 'Education', href: '/education', current: true },
  { name: 'Accountancy', href: '/accountancy', current: false },
  { name: 'Business Administration', href: '/business-administration', current: false },
  { name: 'Arts and Sciences', href: '/arts-and-sciences', current: false },
  { name: 'Maritime', href: '/maritime', current: false },
  { name: 'Health Sciences', href: '/health-sciences', current: false },
  { name: 'Hospitality Management and Tourism', href: '/hospitality', current: false },
]
const stats = [
  { name: 'Total number of students', value: '600' },
  { name: 'Total number of events', value: '12', unit: '' },
  { name: 'Percentage of students with complete requirements', value: '75%' },
  { name: 'Attendance rate', value: '75%' },
]
const statuses = { Completed: 'text-green-400 bg-green-400/10', Error: 'text-rose-400 bg-rose-400/10' }
const activityItems = [
  {
    user: {
      name: 'Jan Lancelot P. Mailig',
      imageUrl:
        'https://scontent.fmnl33-2.fna.fbcdn.net/v/t39.30808-6/256642337_111854787976909_5883138854520283023_n.jpg?_nc_cat=103&cb=99be929b-b574a898&ccb=1-7&_nc_sid=9c7eae&_nc_eui2=AeFE1v3djmBZvmrKjOnJG5iy12hMaUykuo7XaExpTKS6jlfFx3haAEQdA6CU62LdI9bat4c3n7H6JVcFZI57j-mj&_nc_ohc=LsNbglx625cAX-AyJIf&_nc_zt=23&_nc_ht=scontent.fmnl33-2.fna&oh=00_AfAu3l31Kf1M-B2OuXQhY8kQ3gsQPUh6XItGRaeCbcDGYA&oe=65E9BC75',
    },
    commit: '2d89f0c8',
    branch: 'main',
    status: 'Completed',
    duration: '75%',
    date: '8',
    dateTime: '2023-01-23T11:00',
  },
  // More items...
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default function Education() {
  return (
    <Layout>
          <main>
            <header>
              {/* Secondary navigation */}
              <nav className="flex overflow-x-auto border-b border-gray-200 py-4">
                <ul
                  role="list"
                  className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-600 sm:px-6 lg:px-8"
                >
                  {secondaryNavigation.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className={item.current ? 'text-indigo-600' : ''}>
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Heading */}
              <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
                <div>
                  <div className="flex items-center gap-x-3">
                    <div className="flex-none rounded-full bg-blue-400/10 p-1 text-blue-400">
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <h1 className="flex gap-x-3 text-base leading-7">
                      <span className="font-semibold text-gray-900">CS Department</span>
                      <span className="text-gray-600">/</span>
                      <span className="font-semibold text-gray-900">CSS</span>
                    </h1>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
                <div className="order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none">
                  [Manager Name]
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 bg-white sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, statIdx) => (
                  <div
                    key={stat.name}
                    className={classNames(
                      statIdx % 2 === 1 ? 'sm:border-l' : statIdx === 2 ? 'lg:border-l' : '',
                      'border-t border-gray-200 py-6 px-4 sm:px-6 lg:px-8'
                    )}
                  >
                    <p className="text-sm font-medium leading-6 text-gray-600">{stat.name}</p>
                    <p className="mt-2 flex items-baseline gap-x-2">
                      <span className="text-4xl font-semibold tracking-tight text-gray-900">{stat.value}</span>
                      {stat.unit ? <span className="text-sm text-gray-600">{stat.unit}</span> : null}
                    </p>
                  </div>
                ))}
              </div>
            </header>

            {/* Activity list */}
            <div className="border-t border-gray-200 pt-11">
              <h2 className="px-4 text-base font-semibold leading-7 text-gray-900 sm:px-6 lg:px-8">List of Students</h2>
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
                    <th scope="col" className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">
                      Student name
                    </th>
                    <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
                      Stat 1
                    </th>
                    <th scope="col" className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">
                      Requirements
                    </th>
                    <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">
                      Attendance rate
                    </th>
                    <th
                      scope="col"
                      className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
                    >
                      Events attended
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activityItems.map((item) => (
                    <tr key={item.commit}>
                      <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                        <div className="flex items-center gap-x-4">
                          <img src={item.user.imageUrl} alt="" className="h-8 w-8 rounded-full bg-gray-800" />
                          <div className="truncate text-sm font-medium leading-6 text-gray-900">{item.user.name}</div>
                        </div>
                      </td>
                      <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                        <div className="flex gap-x-3">
                          <div className="font-mono text-sm leading-6 text-gray-600">{item.commit}</div>
                          {/* <span className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-400/20">
                            {item.branch}
                          </span> */}
                        </div>
                      </td>
                      <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                        <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                          <time className="text-gray-600 sm:hidden" dateTime={item.dateTime}>
                            {item.date}
                          </time>
                          <div className={classNames(statuses[item.status], 'flex-none rounded-full p-1')}>
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                          </div>
                          <div className="hidden text-gray-900 sm:block">{item.status}</div>
                        </div>
                      </td>
                      <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-600 md:table-cell lg:pr-20">
                        {item.duration}
                      </td>
                      <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-600 sm:table-cell sm:pr-6 lg:pr-8">
                        <time dateTime={item.dateTime}>{item.date}</time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
    </Layout>
  );
}