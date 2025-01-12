import { Link } from "@remix-run/react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Welcome to the admin dashboard. Here you can manage various aspects of the application. Use the sections below to navigate and manage users, books, reviews, comments, and view analytics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/admin/users" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Manage Users</h2>
              <p className="text-gray-600 dark:text-gray-300">
                View, edit, and delete user accounts. Promote users to admin and manage their roles.
              </p>
            </Link>
            <Link to="/admin/books" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Manage Books</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Add, edit, and delete books. View details of each book and manage book information.
              </p>
            </Link>
            <Link to="/admin/reviews" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Manage Reviews</h2>
              <p className="text-gray-600 dark:text-gray-300">
                View, edit, and delete reviews. Manage user feedback and ratings for books.
              </p>
            </Link>
            <Link to="/admin/comments" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Manage Comments</h2>
              <p className="text-gray-600 dark:text-gray-300">
                View, edit, and delete comments. Manage user interactions and discussions.
              </p>
            </Link>
            <Link to="/admin/reports" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Manage Reports</h2>
              <p className="text-gray-600 dark:text-gray-300">
                View and manage user reports. Take action on reported content and users.
              </p>
            </Link>
            <Link to="/admin/analytics" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">View Analytics</h2>
              <p className="text-gray-600 dark:text-gray-300">
                View detailed analytics and statistics about the application usage and performance.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}