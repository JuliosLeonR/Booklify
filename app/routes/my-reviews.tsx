import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { useState, useRef, useEffect } from "react";

type Review = {
    id: number;
    rating: number;
    review_text: string;
    book: {
        id: number;
        title: string;
        cover_image: string;
    };
};

type LoaderData = {
    user: {
        id: number;
        profile_picture: string;
        name: string;
    };
    token: string;
    reviews: Review[];
};

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await requireAuth(request);

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const response = await fetch(`http://localhost/api/user-reviews`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch reviews");
    }

    const data = await response.json();
    const reviews: Review[] = data.reviews;

    return json<LoaderData>({ user, token, reviews });
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    const actionType = formData.get("actionType");

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    if (actionType === "delete") {
        const response = await fetch(`http://localhost/api/reviews/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errors = await response.json();
            return json({ errors }, { status: response.status });
        }

        return json({ success: "Review deleted successfully" });
    } else {
        const rating = formData.get("rating");
        const reviewText = formData.get("review_text");

        const response = await fetch(`http://localhost/api/reviews/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating, review_text: reviewText }),
        });

        if (!response.ok) {
            const errors = await response.json();
            return json({ errors }, { status: response.status });
        }

        const result = await response.json();
        return json({ success: "Review updated successfully", review: result.review });
    }
};

export default function MyReviews() {
    const { reviews } = useLoaderData<LoaderData>();
    const fetcher = useFetcher();
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleEdit = (review: Review) => {
        setSelectedReview(review);
    };

    const handleDelete = (id: number) => {
        fetcher.submit({ id: id.toString(), actionType: "delete" }, { method: "post" });
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            setSelectedReview(null);
        }
    };

    useEffect(() => {
        if (selectedReview) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedReview]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">My Reviews</h2>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                                <img src={`http://localhost/storage/${review.book.cover_image}`} alt={review.book.title} className="w-full max-h-96 object-cover rounded-md" />
                                <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{review.book.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">Rating: {review.rating}⭐</p>
                                <p className="mt-2 text-gray-800 dark:text-gray-100">{review.review_text}</p>
                                <div className="mt-4 flex justify-between">
                                    <button onClick={() => handleEdit(review)} className="text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:underline">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Edit Review</h3>
                        <fetcher.Form method="post" className="space-y-4">
                            <input type="hidden" name="id" value={selectedReview.id} />
                            <input type="hidden" name="actionType" value="update" />
                            <div>
                                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                                <input
                                    type="number"
                                    id="rating"
                                    name="rating"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    defaultValue={selectedReview.rating}
                                    min="1"
                                    max="5"
                                />
                            </div>
                            <div>
                                <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review</label>
                                <textarea
                                    id="review_text"
                                    name="review_text"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    defaultValue={selectedReview.review_text}
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setSelectedReview(null)} className="px-4 py-2 bg-red-500 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                            </div>
                        </fetcher.Form>
                    </div>
                </div>
            )}
        </div>
    );
}