import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";

type Book = {
    id: number;
    title: string;
    author: string;
    cover_image: string;
    description: string;
    genre: {
        name: string;
    };
};

type LoaderData = {
    list: {
        id: number;
        name: string;
        books: Book[];
    };
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await requireAuth(request);

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const response = await fetch(`http://localhost/api/lists/${params.id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch list");
    }

    const data = await response.json();
    const list = data.list;

    return json<LoaderData>({ list });
};

export default function ListDetails() {
    const { list } = useLoaderData<LoaderData>();

    if (!list) {
        return <p className="text-gray-600 dark:text-gray-300">List not found.</p>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">{list.name}</h2>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                        {list.books && list.books.length > 0 ? (
                            list.books.map((book) => (
                                <div key={book.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                                    <img src={book.cover_image.startsWith('http') ? book.cover_image : `http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full h-96 object-cover rounded-md" />
                                    <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{book.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">by {book.author}</p>
                                    <p className="text-gray-600 dark:text-gray-300">Genre: {book.genre?.name || 'Unknown'}</p>
                                    <p className="mt-2 text-gray-800 dark:text-gray-100">{book.description}</p>
                                    <div className="mt-4 flex justify-between">
                                        <Link to={`/books/${book.id}`} className="text-blue-500 hover:underline">Show Book</Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300">No books in this list.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}