import { useLoaderData, Form, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { useState } from "react";
import { parse } from "cookie";
import { requireAdmin } from "~/utils/requireAdmin";


type LoaderData = {
    user: {
        id: number;
        profile_picture: string;
        name: string;
    };
    book: {
        id: number;
        title: string;
        author: string;
    };
};

export const loader: LoaderFunction = async ({ request, params }) => {
    await requireAdmin({ request });
    const { user } = await requireAuth(request);
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const response = await fetch(`http://localhost/api/books/${params.id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch book");
    }

    const data = await response.json();
    const book = data.book;

    return json<LoaderData>({ user, book });
};

export const action: ActionFunction = async ({ request, params }) => {
    const { user } = await requireAuth(request);
    const formData = await request.formData();
    const rating = formData.get("rating");
    const reviewText = formData.get("review_text");

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const reviewData = {
        user_id: user.id,
        book_id: params.id,
        rating,
        review_text: reviewText,
    };

    const response = await fetch(`http://localhost/api/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
        const errors = await response.json();
        return json({ errors }, { status: response.status });
    }

    return redirect(`/books/${params.id}`);
};

export default function MakeReview() {
    const { book } = useLoaderData<LoaderData>();
    const actionData = useActionData();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Review {book.title}</h2>
                    <Form method="post" className="space-y-4">
                        <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                            <div className="flex">
                                {[...Array(5)].map((star, index) => {
                                    index += 1;
                                    return (
                                        <button
                                            type="button"
                                            key={index}
                                            className={index <= (hover || rating) ? "text-yellow-500" : "text-gray-300"}
                                            onClick={() => setRating(index)}
                                            onMouseEnter={() => setHover(index)}
                                            onMouseLeave={() => setHover(rating)}
                                        >
                                            <span className="star">&#9733;</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <input type="hidden" name="rating" value={rating} />
                        </div>
                        <div>
                            <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review</label>
                            <textarea
                                id="review_text"
                                name="review_text"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                        {actionData?.errors && (
                            <div className="text-red-500">
                                {Object.values(actionData.errors).map((error, index) => (
                                    <p key={index}>{error}</p>
                                ))}
                            </div>
                        )}
                        <div className="text-right">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Submit Review
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}