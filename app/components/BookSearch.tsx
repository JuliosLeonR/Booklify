import React, { useState, useEffect, useRef } from 'react';
import { Link } from "@remix-run/react";
import { useNotification } from "~/context/NotificationContext";
import ReportModal from "~/components/ReportModal";

type Genre = {
  id: number;
  name: string;
};

type Book = {
  id: number;
  title: string;
  author: string;
  cover_image: string;
  description: string;
  genre: {
    name: string;
  };
  reviews: {
    rating: number;
  }[];
};

type BookSearchProps = {
  token: string;
};

const BookSearch: React.FC<BookSearchProps> = ({ token }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState({
    genre_id: '',
    author: '',
    title: '',
    order_by_rating: false,
  });
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const { setNotification } = useNotification();
  const modalRef = useRef<HTMLDivElement>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportableId, setReportableId] = useState<number | null>(null);
  const [reportableType, setReportableType] = useState<string>("");
  const [lists, setLists] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      const response = await fetch('http://localhost/api/genres', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGenres(data.genres);
      }
    };

    const fetchLists = async () => {
      const response = await fetch('http://localhost/api/lists', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLists(data.lists);
      }
    };

    fetchGenres();
    fetchLists();
  }, [token]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFilters({
      ...filters,
      [name]: checked,
    });
  };

  const handleSearch = async () => {
    const query = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== false) {
        query.append(key, filters[key]);
      }
    });

    const response = await fetch(`http://localhost/api/search-book?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setBooks(data.books);
    }
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Search Books</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Genre</label>
            <select
              name="genre_id"
              value={filters.genre_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Author</label>
            <input
              type="text"
              name="author"
              value={filters.author}
              onChange={handleInputChange}
              placeholder="Search by author"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              value={filters.title}
              onChange={handleInputChange}
              placeholder="Search by title"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="order_by_rating"
              checked={filters.order_by_rating}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            <label className="text-gray-700 dark:text-gray-300">Order by Rating</label>
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="mt-4 bg-blue-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {books.map((book) => (
          <div key={book.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
            <img src={book.cover_image.startsWith('http') ? book.cover_image : `http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full h-96 object-cover rounded-md" />
            <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{book.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">by {book.author}</p>
            <p className="text-gray-600 dark:text-gray-300">Genre: {book.genre?.name || 'Unknown'}</p>
            <p className="mt-2 text-gray-800 dark:text-gray-100">{book.description}</p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Rating: {book.reviews.length > 0 ? (book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length).toFixed(1) : "No ratings yet"}</p>
            <div className="mt-4 flex justify-between">
              <Link to={`/books/make-review/${book.id}`} className="text-blue-500 hover:underline">Make Review</Link>
              <Link to={`/books/${book.id}`} className="text-blue-500 hover:underline">Show Book</Link>
              <button onClick={() => handleAddToList(book)} className="text-green-500 hover:underline">+ Add to List</button>
              <button onClick={() => handleReport(book.id, "App\\Models\\Book")} className="text-red-500 hover:underline">🚩</button>
            </div>
          </div>
        ))}
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
};

export default BookSearch;