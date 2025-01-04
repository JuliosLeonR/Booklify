import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
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
    user: {
        name: string;
        profile_picture: string;
    };
    reviews: {
        rating: number;
    }[];
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
};

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await requireAuth(request);

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = 24; // Adjusted page size to 24

    const response = await fetch(`http://localhost/api/books?page=${page}&pageSize=${pageSize}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch books");
    }

    const data = await response.json();    
    const books: Book[] = data.books;
    const totalPages = data.totalPages;

    return json<LoaderData>({ user, token, books, totalPages, currentPage: page });
};

export default function Books() {
    const { books, totalPages, currentPage } = useLoaderData<LoaderData>();
    const [searchParams, setSearchParams] = useSearchParams();

    const handlePageChange = (page: number) => {
        searchParams.set("page", page.toString());
        setSearchParams(searchParams);
    };

    return (
        <div>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
                <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-6 sm:p-10">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Books</h2>
                        <p className="text-center text-gray-800 dark:text-gray-100 font-bold">Here you can see all the books that have been uploaded by other users!</p>
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                            {books.map((book) => (
                                <div key={book.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                                    <img src={`http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full h-48 object-cover rounded-md" />
                                    <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{book.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">by {book.author}</p>
                                    <p className="text-gray-600 dark:text-gray-300">Genre: {book.genre.name}</p>
                                    <p className="mt-2 text-gray-800 dark:text-gray-100">{book.description}</p>
                                    <div className="mt-4 flex items-center">
                                        <img
                                            src={`http://localhost/storage/${book.user.profile_picture}`}
                                            alt={book.user.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <p className="ml-2 text-gray-800 dark:text-gray-100">{book.user.name}</p>
                                    </div>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                                        Average Rating: {book.reviews.length > 0 ? (book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length).toFixed(1) : "No ratings yet"}
                                    </p>
                                    <div className="mt-4 flex justify-between">
                                        <Link to={`/books/${book.id}/review`} className="text-blue-500 hover:underline">Make Review</Link>
                                        <Link to={`/books/${book.id}`} className="text-blue-500 hover:underline">Show Book</Link>
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
        </div>
    );
}