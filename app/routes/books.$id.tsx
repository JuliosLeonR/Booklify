import { useLoaderData, Form, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";

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
        description: string;
        cover_image: string;
        reviews: {
            id: number;
            rating: number;
            review_text: string;
            user: {
                name: string;
                profile_picture: string;
            };
            comments: {
                id: number;
                comment: string;
                user: {
                    name: string;
                    profile_picture: string;
                };
                replies: {
                    id: number;
                    comment: string;
                    user: {
                        name: string;
                        profile_picture: string;
                    };
                }[];
            }[];
        }[];
    };
};

export const loader: LoaderFunction = async ({ request, params }) => {
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
    const comment = formData.get("comment");
    const reviewId = formData.get("review_id");

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const commentData = {
        user_id: user.id,
        review_id: reviewId,
        comment,
    };

    const response = await fetch(`http://localhost/api/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
    });

    if (!response.ok) {
        const errors = await response.json();
        return json({ errors }, { status: response.status });
    }

    return redirect(`/books/${params.id}`);
};

export default function ShowBook() {
    const { book } = useLoaderData<LoaderData>();
    const actionData = useActionData();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{book.title}</h2>
                    <img src={`http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full max-h-svh object-cover rounded-md mb-6" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4">by {book.author}</p>
                    <p className="text-gray-800 dark:text-gray-100 mb-6">{book.description}</p>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Reviews</h3>
                    {book.reviews.map((review) => (
                        <div key={review.id} className="mb-6">
                            <div className="flex items-center mb-2">
                                <img
                                    src={`http://localhost/storage/${review.user.profile_picture}`}
                                    alt={review.user.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <p className="ml-2 text-gray-800 dark:text-gray-100">{review.user.name}</p>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Rating: {review.rating}</p>
                            <p className="text-gray-800 dark:text-gray-100 mb-4">{review.review_text}</p>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Comments</h4>
                            {Array.isArray(review.comments) && review.comments.map((comment) => (
                                <div key={comment.id} className="mb-4">
                                    <div className="flex items-center mb-2">
                                        <img
                                            src={`http://localhost/storage/${comment.user.profile_picture}`}
                                            alt={comment.user.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <p className="ml-2 text-gray-800 dark:text-gray-100">{comment.user.name}</p>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-100 mb-2">{comment.comment}</p>
                                    {Array.isArray(comment.replies) && comment.replies.map((reply) => (
                                        <div key={reply.id} className="ml-6 mb-2">
                                            <div className="flex items-center mb-2">
                                                <img
                                                    src={`http://localhost/storage/${reply.user.profile_picture}`}
                                                    alt={reply.user.name}
                                                    className="w-6 h-6 rounded-full"
                                                />
                                                <p className="ml-2 text-gray-800 dark:text-gray-100">{reply.user.name}</p>
                                            </div>
                                            <p className="text-gray-800 dark:text-gray-100">{reply.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <Form method="post" className="space-y-4">
                                <input type="hidden" name="review_id" value={review.id} />
                                <div>
                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add a Comment</label>
                                    <textarea
                                        id="comment"
                                        name="comment"
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
                                        Submit Comment
                                    </button>
                                </div>
                            </Form>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}