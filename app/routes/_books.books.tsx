import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { useState, useRef, useEffect } from "react";
import { useNotification } from "~/context/NotificationContext";
import ReportModal from "~/components/ReportModal";

type Book = {
  id: number;
  title: string;
  author: string;
  cover_image: string;
  description: string;
  genre: {
    name: string;
  };
  user: {
    name: string;
    profile_picture: string;
  };
  reviews: {
    rating: number;
  }[];
};

type List = {
  id: number;
  name: string;
};

type LoaderData = {
  user: {
    id: number;
    profile_picture: string;
    name: string;
    email: string;
    username: string;
  };
  token: string;
  books: Book[];
  totalPages: number;
  currentPage: number;
  lists: List[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await requireAuth(request);

  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const pageSize = 24; // Adjusted page size to 24

  const [booksResponse, listsResponse] = await Promise.all([
    fetch(`http://localhost/api/books?page=${page}&pageSize=${pageSize}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    fetch(`http://localhost/api/lists?user_id=${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ]);

  if (!booksResponse.ok || !listsResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const booksData = await booksResponse.json();
  const listsData = await listsResponse.json();
  const books: Book[] = booksData.books;
  const totalPages = booksData.totalPages;
  const lists: List[] = listsData.lists;

  return json<LoaderData>({ user, token, books, totalPages, currentPage: page, lists });
};

export default function Books() {
  const { books, totalPages, currentPage, lists, token } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const { setNotification } = useNotification();
  const modalRef = useRef<HTMLDivElement>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportableId, setReportableId] = useState<number | null>(null);
  const [reportableType, setReportableType] = useState<string>("");

  const handlePageChange = (page: number) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  const handleAddToList = (book: Book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    const response = await fetch(`http://localhost/api/lists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newListName, is_private: false }),
    });

    if (response.ok) {
      const newList = await response.json();
      await handleAddBookToList(newList.list.id);
    }
  };

  const handleAddBookToList = async (listId: number) => {
    if (!selectedBook) return;

    const response = await fetch(`http://localhost/api/lists/${listId}/add-book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ book_id: selectedBook.id }),
    });

    if (response.ok) {
      setShowModal(false);
      setSelectedBook(null);
      setNotification({ message: "Book added to list successfully", type: "success" });
    } else {
      setNotification({ message: "Failed to add book to list", type: "error" });
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setShowModal(false);
      setSelectedBook(null);
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

  const handleReport = (id: number, type: string) => {
    setReportableId(id);
    setReportableType(type);
    setReportModalVisible(true);
  };

  const handlePreference = async (bookId: number, preference: string) => {
    const response = await fetch('http://localhost/api/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ book_id: bookId, preference }),
    });

    if (response.ok) {
      setNotification({ message: `Book marked as ${preference}`, type: "success" });
    } else {
      setNotification({ message: "Failed to update preference", type: "error" });
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6 sm:p-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Books</h2>
            <p className="text-center text-gray-800 dark:text-gray-100 font-bold mb-6">Explore the collection of books uploaded by other users!</p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <div key={book.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 transition transform hover:scale-105">
                  <img src={book.cover_image.startsWith('http') ? book.cover_image : `http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full h-96 object-cover rounded-md" />
                  <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">by {book.author}</p>
                  <p className="text-gray-600 dark:text-gray-300">Genre: {book.genre.name}</p>
                  <p className="mt-2 text-gray-800 dark:text-gray-100">{book.description}</p>
                  <div className="mt-4 flex items-center">
                    <img
                      src={book.user.profile_picture.startsWith('http') ? book.user.profile_picture : `http://localhost/storage/${book.user.profile_picture}`}
                      alt={book.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <p className="ml-2 text-gray-800 dark:text-gray-100">{book.user.name}</p>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Average Rating: {book.reviews.length > 0 ? (book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length).toFixed(1) : "No ratings yet"}
                  </p>
                  <div className="mt-4 flex justify-between">
                    <Link to={`/books/make-review/${book.id}`} className="text-blue-500 hover:underline">Make Review</Link>
                    <Link to={`/books/${book.id}`} className="text-blue-500 hover:underline">Show Book</Link>
                    <button onClick={() => handleAddToList(book)} className="text-green-500 hover:underline">+ Add to List</button>
                    <button onClick={() => handleReport(book.id, "App\\Models\\Book")} className="text-red-500 hover:underline">🚩</button>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button onClick={() => handlePreference(book.id, 'interested')} className="text-blue-500 hover:underline">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button onClick={() => handlePreference(book.id, 'not_interested')} className="text-red-500 hover:underline">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Add to List</h3>
            {lists.length > 0 ? (
              <div className="space-y-4">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleAddBookToList(list.id)}
                    className="w-full text-left px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {list.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 mb-4">You don't have any lists yet.</p>
            )}
            <div className="mt-4">
              <input
                type="text"
                placeholder="New List Name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <button
                onClick={handleCreateList}
                className="w-full mt-2 bg-blue-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Create List
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportModal
        show={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        reportableId={reportableId!}
        reportableType={reportableType}
        token={token}
      />
    </div>
  );
}