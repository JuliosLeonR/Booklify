import { Link, useLoaderData } from "@remix-run/react";
import { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { parse } from "cookie";

export const meta: MetaFunction = () => {
  return [
    { title: "Booklify - Discover and Share Books" },
    { name: "description", content: "Discover and share your favorite books with Booklify." },
  ];
};

type LoaderData = {
  isAuthenticated: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  let isAuthenticated = false;

  if (token) {
    // Aquí podrías hacer una llamada a la API para verificar el token
    isAuthenticated = true; // Suponiendo que el token es válido
  }

  return json<LoaderData>({ isAuthenticated });
};

export default function Index() {
  const { isAuthenticated } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Welcome to Booklify</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover, share, and review your favorite books with our community.
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/books" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Explore Books</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Browse our extensive collection of books uploaded by users.
              </p>
            </Link>
            <Link to="/add-book" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Add a Book</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Share your favorite books with the community.
              </p>
            </Link>
            <Link to="/rankings" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Rankings</h2>
              <p className="text-gray-600 dark:text-gray-300">
                See the top-rated books and reviews.
              </p>
            </Link>
            <Link to="/users" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Users</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with other book enthusiasts.
              </p>
            </Link>
            <Link to="/for-you" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">For You</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Personalized book recommendations just for you.
              </p>
            </Link>
            <Link to="/my-lists" className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">My Lists</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Organize your favorite books into lists.
              </p>
            </Link>
          </div>
          {!isAuthenticated && (
            <div className="mt-10 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Join our community to discover and share your favorite books!
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md transition duration-150 hover:bg-blue-700">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md transition duration-150 hover:bg-green-700">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}