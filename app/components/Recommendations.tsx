import React, { useEffect, useState } from 'react';
import { useNotification } from "~/context/NotificationContext";

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

type RecommendationsProps = {
    token: string;
};

const Recommendations: React.FC<RecommendationsProps> = ({ token }) => {
    const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
    const { setNotification } = useNotification();

    useEffect(() => {
        const fetchRecommendations = async () => {
            const response = await fetch('http://localhost/api/recommendations', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRecommendedBooks(data.recommendedBooks);
            } else {
                setNotification({ message: "Failed to fetch recommendations", type: "error" });
            }
        };

        fetchRecommendations();
    }, [token, setNotification]);

    const handlePreference = async (bookId: number, preference: string) => {
        const response = await fetch('http://localhost/api/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ book_id: bookId, preference }),
        });

        if (response.ok) {
            setRecommendedBooks(recommendedBooks.filter(book => book.id !== bookId));
            setNotification({ message: `Book marked as ${preference}`, type: "success" });
        } else {
            setNotification({ message: "Failed to update preference", type: "error" });
        }
    };

    return (
        <div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recommendedBooks.map((book) => (
                    <div key={book.id} className="bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md p-4 transition transform hover:scale-105">
                        <img src={book.cover_image.startsWith('http') ? book.cover_image : `http://localhost/storage/${book.cover_image}`} alt={book.title} className="w-full h-96 object-cover rounded-md" />
                        <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{book.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">by {book.author}</p>
                        <p className="text-gray-600 dark:text-gray-300">Genre: {book.genre?.name || 'Unknown'}</p>
                        <p className="mt-2 text-gray-800 dark:text-gray-100">{book.description}</p>
                        <div className="mt-4 flex justify-between">
                            <button onClick={() => handlePreference(book.id, 'interested')} className="text-blue-500 hover:underline">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                            <button onClick={() => handlePreference(book.id, 'not_interested')} className="text-red-500 hover:underline">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;