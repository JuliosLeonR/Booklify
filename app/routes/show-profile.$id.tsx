import { useLoaderData, Link } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";

type User = {
  id: number;
  profile_picture: string;
  name: string;
  username: string;
  books: {
    id: number;
    title: string;
    cover_image: string;
  }[];
  reviews: {
    id: number;
    rating: number;
    review_text: string;
    book: {
      id: number;
      title: string;
    };
  }[];
  friends: {
    id: number;
    profile_picture: string;
    username: string;
  }[];
};

type LoaderData = {
  user: User;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { token } = await requireAuth(request);
  const userResponse = await fetch(`http://localhost/api/users/${params.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error("Failed to fetch user details");
  }

  const userData = await userResponse.json();
  const user = userData.user;

  const booksResponse = await fetch(`http://localhost/api/user-books?user_id=${user.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!booksResponse.ok) {
    throw new Error("Failed to fetch user books");
  }

  const booksData = await booksResponse.json();
  user.books = booksData.books || [];

  const reviewsResponse = await fetch(`http://localhost/api/user-reviews?user_id=${user.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!reviewsResponse.ok) {
    throw new Error("Failed to fetch user reviews");
  }

  const reviewsData = await reviewsResponse.json();
  user.reviews = reviewsData.reviews || [];

  const friendsResponse = await fetch(`http://localhost/api/users/${user.id}/friends`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!friendsResponse.ok) {
    throw new Error("Failed to fetch user friends");
  }

  const friendsData = await friendsResponse.json();
  user.friends = friendsData.friends || [];
  console.log(user.friends)

  return json<LoaderData>({ user });
};

export default function UserDetails() {
  const { user } = useLoaderData<LoaderData>();
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 sm:p-10">
          <div className="flex items-center mb-6">
            <img src={`http://localhost/storage/${user.profile_picture}`} alt={user.name} className="w-20 h-20 rounded-full" />
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">@{user.username}</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 text-blue-500 hover:underline"
              >
                {user.friends.length} Friends
              </button>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Books</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {user.books.map((book) => (
              <div key={book.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                <img src={`http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full h-80 object-cover rounded-md" />
                <h4 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{book.title}</h4>
              </div>
            ))}
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-6 mb-4">Reviews</h3>
          <div className="space-y-4">
            {user.reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{review.book.title}</h4>
                <p className="text-gray-600 dark:text-gray-300">Rating: {review.rating}⭐</p>
                <p className="mt-2 text-gray-800 dark:text-gray-100">{review.review_text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Friends</h3>
            <div className="space-y-4">
              {user.friends.map((friend) => (
                <Link
                  key={friend.id}
                  to={`/show-profile/${friend.id}`}
                  className="flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
                >
                  <img
                    src={`http://localhost/storage/${friend.profile_picture}`}
                    alt={friend.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="text-gray-800 dark:text-gray-100">@{friend.username}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}