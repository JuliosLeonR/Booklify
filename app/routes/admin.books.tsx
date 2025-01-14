import { useLoaderData, Link, Form, useFetcher } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState, useEffect } from "react";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import Modal from "~/components/Modal";
import { useNotification } from "~/context/NotificationContext";
import { PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";

type Book = {
  id: number;
  title: string;
  author: string;
  description: string;
  user_id: number;
};

type LoaderData = {
  books: Book[];
  token: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await requireAuth(request);
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  const response = await fetch(`http://localhost/api/admin/books?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  const data = await response.json();
  return json<LoaderData>({ books: data.books, token });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const bookId = formData.get("bookId");

  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  let response;
  if (actionType === "delete") {
    response = await fetch(`http://localhost/api/admin/books/${bookId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else if (actionType === "update") {
    const title = formData.get("title");
    const author = formData.get("author");
    const description = formData.get("description");

    response = await fetch(`http://localhost/api/admin/books/${bookId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, author, description }),
    });
  }

  if (!response.ok) {
    return json({ error: "Action failed" }, { status: response.status });
  }

  return redirect("/admin/books");
};

export default function ManageBooks() {
  const { books, token } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const { setNotification } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    if (fetcher.data?.error) {
      setNotification({ message: fetcher.data.error, type: "error" });
    } else if (fetcher.state === "idle" && fetcher.data) {
      setNotification({ message: "Action completed successfully", type: "success" });
    }
  }, [fetcher, setNotification]);

  const handleEditClick = (book: Book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  const handleDeleteClick = (bookId: number) => {
    fetcher.submit({ actionType: "delete", bookId: bookId.toString() }, { method: "post" });
  };

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      if (value) {
        params.append(key, value.toString());
      }
    });

    fetcher.load(`/admin/books?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Manage Books</h1>
          <div className="mb-4">
            <Form method="get" className="flex space-x-4" onSubmit={handleFilterSubmit}>
              <input
                type="text"
                name="book_id"
                placeholder="Book ID"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
              <input
                type="text"
                name="user_id"
                placeholder="User ID"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
              <input
                type="text"
                name="title"
                placeholder="Title"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Filter
              </button>
            </Form>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ID</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">User ID</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Title</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Author</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Description</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{book.id}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{book.user_id}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{book.title}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{book.author}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{book.description}</td>
       
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEditClick(book)} className="text-blue-500 hover:underline">
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <Link to={`/admin/show-book/${book.id}`} className="text-green-500 hover:underline">
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleDeleteClick(book.id)} className="text-red-500 hover:underline">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedBook && (
        <Modal show={showModal} onClose={handleModalClose} title="Edit Book">
          <Form method="post" action={`/admin/books/${selectedBook.id}`}>
            <input type="hidden" name="actionType" value="update" />
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                defaultValue={selectedBook.title}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
              <input
                type="text"
                name="author"
                id="author"
                defaultValue={selectedBook.author}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                name="description"
                id="description"
                defaultValue={selectedBook.description}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
}