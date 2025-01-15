import { useLoaderData, Form, useActionData, redirect, useFetcher } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { useState, useRef, useEffect } from "react";
import ReportModal from "~/components/ReportModal";
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
        description: string;
        cover_image: string;
        reviews: {
            id: number;
            rating: number;
            review_text: string;
            user: {
                id: number;
                name: string;
                profile_picture: string;
            };
            comments: {
                id: number;
                comment: string;
                user: {
                    id: number;
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
    token: string;
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

    return json<LoaderData>({ user, book, token });
};

export const action: ActionFunction = async ({ request, params }) => {
    const { user } = await requireAuth(request);
    const formData = await request.formData();
    const actionType = formData.get("actionType");
    const id = formData.get("id");
    const reviewId = formData.get("review_id");
    const comment = formData.get("comment");
    const rating = formData.get("rating");
    const reviewText = formData.get("review_text");

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    if (actionType === "deleteReview") {
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

        return redirect(`/books/${params.id}`);
    } else if (actionType === "deleteComment") {
        const response = await fetch(`http://localhost/api/comments/${id}`, {
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

        return redirect(`/books/${params.id}`);
    } else if (actionType === "updateReview") {
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

        return redirect(`/books/${params.id}`);
    } else if (actionType === "updateComment") {
        const response = await fetch(`http://localhost/api/comments/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ comment }),
        });

        if (!response.ok) {
            const errors = await response.json();
            return json({ errors }, { status: response.status });
        }

        return redirect(`/books/${params.id}`);
    } else {
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
    }
};

export default function ShowBook() {
    const { book, user, token } = useLoaderData<LoaderData>();
    const actionData = useActionData();
    const fetcher = useFetcher();
    const [showAllComments, setShowAllComments] = useState<{ [key: number]: boolean }>({});
    const [selectedReview, setSelectedReview] = useState<{ id: number; rating: number; review_text: string } | null>(null);
    const [selectedComment, setSelectedComment] = useState<{ id: number; comment: string } | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportableId, setReportableId] = useState<number | null>(null);
    const [reportableType, setReportableType] = useState<string>("");

    const toggleShowAllComments = (reviewId: number) => {
        setShowAllComments((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId],
        }));
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            setSelectedReview(null);
            setSelectedComment(null);
        }
    };

    useEffect(() => {
        if (selectedReview || selectedComment) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedReview, selectedComment]);

    const handleReport = (id: number, type: string) => {
        setReportableId(id);
        setReportableType(type);
        setReportModalVisible(true);
    };

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-4xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{book.title}</h2>
                    <img src={`http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full max-h-svh object-cover rounded-md mb-6" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4">by {book.author}</p>
                    <p className="text-gray-800 dark:text-gray-100 mb-6">{book.description}</p>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Reviews</h3>
                    {book.reviews.map((review) => (
                        <div key={review.id} className="mb-6 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center mb-2">
                                <img
                                    src={`http://localhost/storage/${review.user.profile_picture}`}
                                    alt={review.user.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <p className="ml-2 text-gray-800 dark:text-gray-100">{review.user.name}</p>
                                {review.user.id === user.id && (
                                    <div className="ml-auto flex space-x-2">
                                        <button onClick={() => setSelectedReview({ id: review.id, rating: review.rating, review_text: review.review_text })} className="text-blue-500 hover:underline">Edit</button>
                                        <fetcher.Form method="post">
                                            <input type="hidden" name="id" value={review.id} />
                                            <input type="hidden" name="actionType" value="deleteReview" />
                                            <button type="submit" className="text-red-500 hover:underline">Delete</button>
                                        </fetcher.Form>
                                    </div>
                                )}
                                <button onClick={() => handleReport(review.id, "App\\Models\\Review")} className="ml-2 text-red-500 hover:underline">🚩</button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Rating: {review.rating}⭐</p>
                            <p className="text-gray-800 dark:text-gray-100 mb-4">{review.review_text}</p>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Comments</h4>
                            {Array.isArray(review.comments) && review.comments.slice(0, showAllComments[review.id] ? review.comments.length : 2).map((comment) => (
                                <div key={comment.id} className="mb-4 ml-4 p-2 bg-gray-300 dark:bg-gray-600 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <img
                                            src={`http://localhost/storage/${comment.user.profile_picture}`}
                                            alt={comment.user.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <p className="ml-2 text-gray-800 dark:text-gray-100">{comment.user.name}</p>
                                        {comment.user.id === user.id && (
                                            <div className="ml-auto flex space-x-2">
                                                <button onClick={() => setSelectedComment({ id: comment.id, comment: comment.comment })} className="text-blue-500 hover:underline">Edit</button>
                                                <fetcher.Form method="post">
                                                    <input type="hidden" name="id" value={comment.id} />
                                                    <input type="hidden" name="actionType" value="deleteComment" />
                                                    <button type="submit" className="text-red-500 hover:underline">Delete</button>
                                                </fetcher.Form>
                                            </div>
                                        )}
                                        <button onClick={() => handleReport(comment.id, "App\\Models\\Comment")} className="ml-2 text-red-500 hover:underline">🚩</button>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-100 mb-2">{comment.comment}</p>
                                    {Array.isArray(comment.replies) && comment.replies.map((reply) => (
                                        <div key={reply.id} className="ml-6 mb-2 p-2 bg-gray-300 dark:bg-gray-500 rounded-lg">
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
                            {review.comments.length > 2 && (
                                <button
                                    onClick={() => toggleShowAllComments(review.id)}
                                    className="text-blue-500 hover:underline"
                                >
                                    {showAllComments[review.id] ? "Hide comments" : "See all the comments"}
                                </button>
                            )}
                            <Form method="post" className="space-y-4 mt-4">
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

            {selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Edit Review</h3>
                        <fetcher.Form method="post" className="space-y-4">
                            <input type="hidden" name="id" value={selectedReview.id} />
                            <input type="hidden" name="actionType" value="updateReview" />
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

            {selectedComment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Edit Comment</h3>
                        <fetcher.Form method="post" className="space-y-4">
                            <input type="hidden" name="id" value={selectedComment.id} />
                            <input type="hidden" name="actionType" value="updateComment" />
                            <div>
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comment</label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    defaultValue={selectedComment.comment}
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setSelectedComment(null)} className="px-4 py-2 bg-red-500 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                            </div>
                        </fetcher.Form>
                    </div>
                </div>
            )}

            <ReportModal
                show={reportModalVisible}
                onClose={() => setReportModalVisible(false)}
                reportableId={reportableId!}
                reportableType={reportableType}
                token={token}
            />
        </div>
    );
}