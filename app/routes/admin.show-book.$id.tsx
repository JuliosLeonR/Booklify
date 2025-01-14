import { useLoaderData, Form, redirect } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";

type Book = {
  id: number;
  title: string;
  author: string;
  description: string;
};

type LoaderData = {
  book: Book;
  token: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user } = await requireAuth(request);
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const response = await fetch(`http://localhost/api/admin/books/${params.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch book");
  }

  const data = await response.json();
  return json<LoaderData>({ book: data.book, token });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const author = formData.get("author");
  const description = formData.get("description");

  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const response = await fetch(`http://localhost/api/admin/books/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, author, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to update book");
  }

  return redirect("/admin/books");
};

export default function EditBook() {
  const { book } = useLoaderData<LoaderData>();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Edit Book</h1>
      <Form method="post" className="space-y-6">
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Title:</label>
          <input
            type="text"
            name="title"
            defaultValue={book.title}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Author:</label>
          <input
            type="text"
            name="author"
            defaultValue={book.author}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Description:</label>
          <textarea
            name="description"
            defaultValue={book.description}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </Form>
    </div>
  );
}