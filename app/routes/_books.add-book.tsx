import { Form, useActionData, useLoaderData, redirect } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { useNotification } from "~/context/NotificationContext";
import { useEffect } from "react";

type Genre = {
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
    genres: Genre[];
};

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await requireAuth(request);
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const genresResponse = await fetch(`http://localhost/api/genres`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!genresResponse.ok) {
        throw new Error("Failed to fetch genres");
    }

    const genresData = await genresResponse.json();
    const genres: Genre[] = genresData.genres;

    return json<LoaderData>({ user, token, genres });
};

export const action: ActionFunction = async ({ request }) => {
    const { user } = await requireAuth(request);
    const formData = await request.formData();
    const title = formData.get("title");
    const author = formData.get("author");
    const description = formData.get("description");
    const genreId = formData.get("genre_id");
    const coverImage = formData.get("cover_image");
    const user_id = user.id

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const bookData = {
        user_id,
        title,
        author,
        description,
        genre_id: genreId,
    };

    const response = await fetch(`http://localhost/api/books`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
    });

    if (!response.ok) {
        const errors = await response.json();
        return json({ errors }, { status: response.status });
    }

    const result = await response.json();
    console.log(result)

    console.log(`Cover Image: ${coverImage}`)
    if (coverImage && coverImage instanceof File && coverImage.size > 0) {
        const formData = new FormData();
        formData.append("cover_image", coverImage);
        console.log(`http://localhost/api/books/${result.id}/update-cover`)

        const imageResponse = await fetch(`http://localhost/api/books/${result.book.id}/update-cover`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!imageResponse.ok) {
            const errors = await imageResponse.json();
            console.log(Object.entries(errors))
            return json({ errors }, { status: imageResponse.status });
        }
    }

    return redirect("/my-books");
};

export default function AddBook() {
    const { genres } = useLoaderData<LoaderData>();
    const actionData = useActionData();
    const { setNotification } = useNotification();

    useEffect(() => {
        if (actionData?.errors) {
            setNotification({ message: "Failed to add book", type: "error" });
        } else if (actionData?.success) {
            setNotification({ message: "Book added successfully", type: "success" });
        }
    }, [actionData, setNotification]);

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-4xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Add a New Book</h2>
                    <Form method="post" encType="multipart/form-data" className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                            <input
                                type="text"
                                id="author"
                                name="author"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="genre_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
                            <select
                                id="genre_id"
                                name="genre_id"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            >
                                {genres.map((genre) => (
                                    <option key={genre.id} value={genre.id}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
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
                        <div className="text-right">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Add Book
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}