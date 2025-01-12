import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { json } from "@remix-run/node";

type LoaderData = {
  user: {
    profile_picture: string;
    name: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await requireAuth(request);
  return json({ user });
};

export default function Dashboard() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="flex items-center mb-6">
            <img
              src={`http://localhost/storage/${user.profile_picture}`}
              alt={user.name}
              className="w-20 h-20 rounded-full border-2 border-emerald-400"
            />
            <div className="ml-4">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Welcome, {user.name}!</h2>
              <p className="text-gray-600 dark:text-gray-300">@{user.name}</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">About Booklify</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Booklify is your go-to platform for discovering, reviewing, and sharing books. Connect with other book enthusiasts, create and manage your own book lists, and stay updated with the latest book trends.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Discover Books</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore a vast collection of books across various genres. Use our search feature to find books by title, author, or genre.
                </p>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Review and Rate</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Share your thoughts on the books you've read. Write reviews and rate books to help others discover great reads.
                </p>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Connect with Friends</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with other book lovers. Send friend requests, view profiles, and see what your friends are reading.
                </p>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Create Lists</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Organize your favorite books into lists. Create custom lists for different genres, authors, or themes.
                </p>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Stay Updated</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Get notifications about new book releases, friend activities, and updates on your reviews and reports.
                </p>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Report Issues</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Help us maintain a healthy community by reporting inappropriate content or issues you encounter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}