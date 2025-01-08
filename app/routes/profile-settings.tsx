import { useLoaderData, Form, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { useNotification } from "~/context/NotificationContext";
import { useEffect, useState } from "react";

type LoaderData = {
    user: {
        id: number;
        profile_picture: string;
        name: string;
        email: string;
        username: string;
    };
    token: string;
};

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await requireAuth(request);

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;
    return json<LoaderData>({ user, token });
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    const name = formData.get("name");
    const email = formData.get("email");
    const username = formData.get("username");
    const password = formData.get("password");

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    if (!token) {
        return json({ errors: "Authorization token is missing" }, { status: 401 });
    }

    const saveToDb: any = {};
    if (name) saveToDb.name = name;
    if (email) saveToDb.email = email;
    if (username) saveToDb.username = username;
    if (password) saveToDb.password = password;

    try {
        const response = await fetch(`http://localhost/api/users/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(saveToDb),
        });

        if (!response.ok) {
            const errors = await response.json();
            return json({ errors }, { status: response.status });
        }

        const result = await response.json();
        return json({ success: "Profile updated successfully", user: result.user });
    } catch (error) {
        console.error("Error updating profile:", error);
        return json({ errors: "An unexpected error occurred" }, { status: 500 });
    }
};

export default function Profile() {
    const { user, token } = useLoaderData<{ user: LoaderData["user"]; token: string }>();
    const actionData = useActionData();
    const { setNotification } = useNotification();
    const [serverResponse, setServerResponse] = useState<string | null>(null);

    useEffect(() => {
        if (actionData?.errors) {
            setNotification({ message: "Update failed", type: "error" });
            setServerResponse(actionData.errors);
        } else if (actionData?.success) {
            setNotification({ message: actionData.success, type: "success" });
            setServerResponse(null);
        }
    }, [actionData, setNotification]);



    const handleImageUpdate = async () => {
        const fileInput = document.getElementById("profile_picture") as HTMLInputElement;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            return;
        }

        //const token = "28|RFWEUlRqiZVpUVo1C2kJLYo0pfxxlV7CniQPzWyD12e08e72";

        if (!token) {
            setNotification({ message: "Authorization token is missing", type: "error" });
            return;
        }

        const formData = new FormData();
        formData.append("profile_picture", fileInput.files[0]);

        try {
            const response = await fetch(`http://localhost/api/users/${user.id}/update-profile-picture`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error updating profile picture');
            }

            await response.json();
            setNotification({ message: "Profile picture updated successfully", type: "success" });

        } catch (error) {
            setNotification({ message: "Error updating profile picture", type: "error" });
            throw new Error(String(error));

        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Edit Profile</h2>
                    {serverResponse && (
                        <div className="mb-4 text-red-500">
                            {typeof serverResponse === "string" ? serverResponse : JSON.stringify(serverResponse)}
                        </div>
                    )}
                    <Form method="post" encType="multipart/form-data">
                        <input type="hidden" name="id" value={user.id} />
                        {/* Profile Picture */}
                        <div className="flex items-center mb-6">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <img
                                    id="profilePreview"
                                    src={`http://localhost/storage/${user.profile_picture}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                <label
                                    htmlFor="profile_picture"
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 cursor-pointer transition duration-150 z-10"
                                >
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Edit</span>
                                </label>
                                <input
                                    id="profile_picture"
                                    name="profile_picture"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => {
                                        const input = event.target;
                                        const reader = new FileReader();
                                        reader.onload = function () {
                                            const preview = document.getElementById("profilePreview") as HTMLImageElement;
                                            preview.src = reader.result as string;
                                        };
                                        if (input.files && input.files[0]) {
                                            reader.readAsDataURL(input.files[0]);
                                            handleImageUpdate(); // Llamar a la función para actualizar la imagen
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div className="mb-4 mt-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Enter your name"
                                defaultValue={user.name}
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Enter your email"
                                defaultValue={user.email}
                            />
                        </div>

                        {/* Username */}
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Enter your username"
                                defaultValue={user.username}
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Enter new password"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="text-right">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}