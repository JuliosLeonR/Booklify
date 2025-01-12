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
    <div>
      <h1>Edit Book</h1>
      <Form method="post">
        <label>
          Title:
          <input type="text" name="title" defaultValue={book.title} />
        </label>
        <label>
          Author:
          <input type="text" name="author" defaultValue={book.author} />
        </label>
        <label>
          Description:
          <textarea name="description" defaultValue={book.description} />
        </label>
        <button type="submit">Save</button>
      </Form>
    </div>
  );
}