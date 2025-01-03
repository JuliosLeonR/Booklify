import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { useState, useRef, useEffect } from "react";

type Book = {
    id: number;
    title: string;
    author: string;
    cover_image: string;
    description: string;
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
};

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await requireAuth(request);

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const response = await fetch(`http://localhost/api/user-books`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch books");
    }

    const data = await response.json();
    const books: Book[] = data.books;

    return json<LoaderData>({ user, token, books });
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    const title = formData.get("title");
    const author = formData.get("author");
    const description = formData.get("description");
    const coverImage = formData.get("cover_image");

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const updateResponse = await fetch(`http://localhost/api/books/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, author, description }),
    });

    if (!updateResponse.ok) {
        const errors = await updateResponse.json();
        return json({ errors }, { status: updateResponse.status });
    }

    if (coverImage && coverImage instanceof File) {
        const formData = new FormData();
        formData.append("cover_image", coverImage);

        const imageResponse = await fetch(`http://localhost/api/books/${id}/update-cover`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!imageResponse.ok) {
            const errors = await imageResponse.json();
            return json({ errors }, { status: imageResponse.status });
        }
    }

    const result = await updateResponse.json();
    return json({ success: "Book updated successfully", book: result.book });
};

export default function MyBooks() {
    const { user, books } = useLoaderData<LoaderData>();
    const fetcher = useFetcher();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleEdit = (book: Book) => {
        setSelectedBook(book);
    };

    const handleDelete = async (id: number) => {
        const response = await fetch(`/api/books/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });

        if (response.ok) {
            window.location.reload();
        } else {
            alert("Failed to delete book");
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            setSelectedBook(null);
        }
    };

    useEffect(() => {
        if (selectedBook) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedBook]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">My Books</h2>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                        {books.map((book) => (
                            <div key={book.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                                <img src={`http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full max-h-96 object-cover rounded-md" />
                                <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{book.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">by {book.author}</p>
                                <p className="mt-2 text-gray-800 dark:text-gray-100">{book.description}</p>
                                <div className="mt-4 flex justify-between">
                                    <button onClick={() => handleEdit(book)} className="text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(book.id)} className="text-red-500 hover:underline">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Edit Book</h3>
                        <fetcher.Form method="post" encType="multipart/form-data" className="space-y-4">
                            <input type="hidden" name="id" value={selectedBook.id} />
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    defaultValue={selectedBook.title}
                                />
                            </div>
                            <div>
                                <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    defaultValue={selectedBook.author}
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    defaultValue={selectedBook.description}
                                />
                            </div>
                            <div>
                                <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image</label>
                                <input
                                    type="file"
                                    id="cover_image"
                                    name="cover_image"
                                    accept="image/*"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setSelectedBook(null)} className="px-4 py-2 bg-red-500 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                            </div>
                        </fetcher.Form>
                    </div>
                </div>
            )}
        </div>
    );
}