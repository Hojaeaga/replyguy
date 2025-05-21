import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8 gap-8 bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Subscriber Analytics Dashboard</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          View and manage your subscriber data in one place
        </p>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Quick Access</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Get started by exploring subscriber data or viewing analytics reports.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/subscribers"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Subscribers
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            disabled
          >
            Analytics Reports
            <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full dark:bg-gray-600 dark:text-gray-300">Coming Soon</span>
          </button>
        </div>
      </div>
    </div>
  );
}
