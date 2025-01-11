import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { useState } from "react";
import FriendsModal from "~/components/FriendsModal";

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
  lists: {
    id: number;
    name: string;
  }[];
  friends: {
    id: number;
    profile_picture: string;
    username: string;
    name: string;
  }[];
};

type LoaderData = {
  user: User;
};

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await requireAuth(request);

  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const [booksResponse, reviewsResponse, listsResponse, friendsResponse] = await Promise.all([
    fetch(`http://localhost/api/user-books?user_id=${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    fetch(`http://localhost/api/user-reviews?user_id=${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    fetch(`http://localhost/api/user-lists?user_id=${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    fetch(`http://localhost/api/users/${user.id}/friends`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ]);

  if (!booksResponse.ok || !reviewsResponse.ok || !listsResponse.ok || !friendsResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const booksData = await booksResponse.json();
  const reviewsData = await reviewsResponse.json();
  const listsData = await listsResponse.json();
  const friendsData = await friendsResponse.json();

  user.books = booksData.books || [];
  user.reviews = reviewsData.reviews || [];
  user.lists = listsData.lists || [];
  user.friends = friendsData.friends || [];

  return json<LoaderData>({ user });
};

export default function MyProfile() {
  const { user } = useLoaderData<LoaderData>();
  const [activeTab, setActiveTab] = useState<'books' | 'reviews' | 'lists'>('books');
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 sm:p-10">
          <div className="flex items-center mb-6">
            <img src={`http://localhost/storage/${user.profile_picture}`} alt={user.name} className="w-20 h-20 rounded-full" />
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">@{user.username}</p>
              <button onClick={() => setShowFriendsModal(true)} className="mt-2 text-blue-500 hover:underline">{user.friends.length} Friends</button>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mb-6">
            <button onClick={() => setActiveTab('books')} className={`text-blue-500 hover:underline ${activeTab === 'books' ? 'font-bold' : ''}`}>Books</button>
            <button onClick={() => setActiveTab('reviews')} className={`text-blue-500 hover:underline ${activeTab === 'reviews' ? 'font-bold' : ''}`}>Reviews</button>
            <button onClick={() => setActiveTab('lists')} className={`text-blue-500 hover:underline ${activeTab === 'lists' ? 'font-bold' : ''}`}>Lists</button>
          </div>
          <div className="space-y-6">
            {activeTab === 'books' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Books</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {user.books.map((book) => (
                    <div key={book.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                      <img src={`http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full h-80 object-cover rounded-md" />
                      <h4 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{book.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Reviews</h3>
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
            )}
            {activeTab === 'lists' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Lists</h3>
                <div className="space-y-4">
                  {user.lists.map((list) => (
                    <div key={list.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{list.name}</h4>
                      <Link to={`/my-lists/${list.id}`} className="text-blue-500 hover:underline">View List</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <FriendsModal show={showFriendsModal} onClose={() => setShowFriendsModal(false)} friends={user.friends} />
    </div>
  );
}