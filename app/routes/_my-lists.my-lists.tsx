import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { useState, useRef, useEffect } from "react";
import { useNotification } from "~/context/NotificationContext";

type List = {
    id: number;
    name: string;
    is_private: boolean;
};

type User = {
    id: number;
    name: string;
    profile_picture: string;
};

type LoaderData = {
    lists: List[];
    sharedLists: List[];
    friends: User[];
    token: string;
};

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await requireAuth(request);

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    const [listsResponse, sharedListsResponse, friendsResponse] = await Promise.all([
        fetch(`http://localhost/api/lists?user_id=${user.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
        fetch(`http://localhost/api/shared-lists`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
        fetch(`http://localhost/api/users/${user.id}/friends`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
    ]);

    if (!listsResponse.ok || !friendsResponse.ok) {
        throw new Error("Failed to fetch data");
    }

    const listsData = await listsResponse.json();
    const friendsData = await friendsResponse.json();
    const lists: List[] = listsData.lists;
    const friends: User[] = friendsData.friends;

    let sharedLists: List[] = [];
    if (sharedListsResponse.ok) {
        const sharedListsData = await sharedListsResponse.json();
        sharedLists = sharedListsData.sharedLists;
    }

    return json<LoaderData>({ lists, sharedLists, friends, token });
};

export default function MyLists() {
    const { lists, sharedLists, friends, token } = useLoaderData<LoaderData>();
    const [selectedList, setSelectedList] = useState<List | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [userId, setUserId] = useState("");
    const [newListName, setNewListName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const { setNotification } = useNotification();
    const modalRef = useRef<HTMLDivElement>(null);

    const handleEditList = (list: List) => {
        setSelectedList(list);
        setNewListName(list.name);
        setIsPrivate(list.is_private);
        setShowModal(true);
    };

    const handleUpdateList = async () => {
        if (!selectedList) return;

        const response = await fetch(`http://localhost/api/lists/${selectedList.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: newListName, is_private: isPrivate }),
        });

        if (response.ok) {
            setNotification({ message: "List updated successfully", type: "success" });
            setShowModal(false);
            setSelectedList(null);
        } else {
            setNotification({ message: "Failed to update list", type: "error" });
        }
    };

    const handleShareList = async () => {
        const response = await fetch(`http://localhost/api/lists/${selectedList?.id}/share`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: userId }),
        });

        if (response.ok) {
            setNotification({ message: "List shared successfully", type: "success" });
            setShowShareModal(false);
        } else {
            setNotification({ message: "Failed to share list", type: "error" });
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            setShowModal(false);
            setShowShareModal(false);
            setSelectedList(null);
        }
    };

    useEffect(() => {
        if (showModal || showShareModal) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showModal, showShareModal]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">My Lists</h2>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                        {lists.map((list) => (
                            <div key={list.id} className="relative bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                                <Link to={`/my-lists/${list.id}`} className="block">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{list.name}</h3>
                                </Link>
                                <button
                                    onClick={() => handleEditList(list)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                                >
                                    &#x22EE;
                                </button>
                            </div>
                        ))}
                    </div>
                    {sharedLists.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center mt-10">Shared Lists</h2>
                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                                {sharedLists.map((list) => (
                                    <div key={list.id} className="relative bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                                        <Link to={`/my-lists/${list.id}`} className="block">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{list.name}</h3>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Edit List</h3>
                        <div className="mb-4">
                            <label htmlFor="listName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                List Name
                            </label>
                            <input
                                type="text"
                                id="listName"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="isPrivate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Private
                            </label>
                            <input
                                type="checkbox"
                                id="isPrivate"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div className="text-right">
                            <button
                                onClick={handleUpdateList}
                                className="bg-blue-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Save Changes
                            </button>
                        </div>
                        <div className="text-right mt-4">
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="bg-green-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Share List
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Share List</h3>
                        <div className="mb-4">
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Friend
                            </label>
                            <select
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                <option value="">Select a friend</option>
                                {friends.map((friend) => (
                                    <option key={friend.id} value={friend.id}>
                                        {friend.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-right">
                            <button
                                onClick={handleShareList}
                                className="bg-blue-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}