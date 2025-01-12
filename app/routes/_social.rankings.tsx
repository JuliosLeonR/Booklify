import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { parse } from "cookie";
import { useState, useEffect } from "react";

type User = {
  id: number;
  profile_picture: string;
  name: string;
  reviews_count?: number;
  books_count?: number;
};

type LoaderData = {
  topUsersByReviews: User[];
  topUsersByBooks: User[];
  token: string | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const authToken = cookies.token;

  const [reviewsResponse, booksResponse] = await Promise.all([
    fetch("http://localhost/api/rankings/top-users-reviews", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }),
    fetch("http://localhost/api/rankings/top-users-books", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }),
  ]);

  if (!reviewsResponse.ok || !booksResponse.ok) {
    throw new Error("Failed to fetch rankings");
  }

  const topUsersByReviews = await reviewsResponse.json();
  const topUsersByBooks = await booksResponse.json();

  return json<LoaderData>({
    topUsersByReviews: topUsersByReviews.users,
    topUsersByBooks: topUsersByBooks.users,
    token: authToken,
  });
};

export default function Rankings() {
  const { topUsersByReviews, topUsersByBooks, token } = useLoaderData<LoaderData>();
  const [period, setPeriod] = useState("total");
  const [reviews, setReviews] = useState(topUsersByReviews);
  const [books, setBooks] = useState(topUsersByBooks);

  useEffect(() => {
    async function fetchRankings() {
      if (!token) {
        console.error("No token found");
        return;
      }

      const [reviewsResponse, booksResponse] = await Promise.all([
        fetch(`http://localhost/api/rankings/top-users-reviews?period=${period}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`http://localhost/api/rankings/top-users-books?period=${period}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (reviewsResponse.ok && booksResponse.ok) {
        const topUsersByReviews = await reviewsResponse.json();
        const topUsersByBooks = await booksResponse.json();
        setReviews(topUsersByReviews.users);
        setBooks(topUsersByBooks.users);
      } else {
        console.error("Failed to fetch rankings");
      }
    }

    fetchRankings();
  }, [period, token]);

  const podiumStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: "1rem",
  };

  const placeStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1rem",
    borderRadius: "0.5rem",
    backgroundColor: "#f3f4f6",
    color: "#1f2937",
  };

  const place1Styles = {
    ...placeStyles,
    order: 2,
    backgroundColor: "#ffd700",
  };

  const place2Styles = {
    ...placeStyles,
    order: 1,
    backgroundColor: "#c0c0c0",
  };

  const place3Styles = {
    ...placeStyles,
    order: 3,
    backgroundColor: "#cd7f32",
  };

  const renderPodium = (users: User[], type: "reviews" | "books") => (
    <div style={podiumStyles}>
      {users.slice(0, 3).map((user, index) => (
        <div
          key={user.id}
          style={
            index === 0
              ? place1Styles
              : index === 1
              ? place2Styles
              : place3Styles
          }
        >
          <img
            src={`http://localhost/storage/${user.profile_picture}`}
            alt={user.name}
            className="w-20 h-20 rounded-full"
          />
          <p className="text-lg font-bold">{user.name}</p>
          <p className="text-sm">
            {type === "reviews"
              ? `${user.reviews_count} reviews`
              : `${user.books_count} books`}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
            Top Users
          </h2>
          <div className="mb-6">
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Period
            </label>
            <select
              id="period"
              name="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="total">Total</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Top Users by Reviews
            </h3>
            {renderPodium(reviews, "reviews")}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Top Users by Books
            </h3>
            {renderPodium(books, "books")}
          </div>
        </div>
      </div>
    </div>
  );
}