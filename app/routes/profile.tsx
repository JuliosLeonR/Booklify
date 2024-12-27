import { useLoaderData, Form, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { useNotification } from "~/context/NotificationContext";
import { useEffect } from "react";

type LoaderData = {
    user: {
        id: number;
        profile_picture: string;
        name: string;
        email: string;
        username: string;
        //bio: string;
    };
};

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await requireAuth(request);
    return json<LoaderData>({ user });
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    const name = formData.get("name");
    const email = formData.get("email");
    const username = formData.get("username");
    const password = formData.get("password");
    //const bio = formData.get("bio");
    const profile_picture = formData.get("profile_picture");

    const response = await fetch(`http://localhost/api/users/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${request.headers.get("Authorization")}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errors = await response.json();
        return { errors };
    }

    return redirect("/profile");
};

export default function Profile() {
    const { user } = useLoaderData<LoaderData>();
    const actionData = useActionData();
    const { setNotification } = useNotification();

    useEffect(() => {
        if (actionData?.errors) {
            setNotification({ message: "Update failed", type: "error" });
        } else if (actionData) {
            setNotification({ message: "Profile updated successfully", type: "success" });
        }
    }, [actionData, setNotification]);

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
                    <Form method="post" encType="multipart/form-data">
                        <input type="hidden" name="id" value={user.id} />
                        {/* Profile Picture */}
                        <div className="flex items-center mb-6">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
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
                                    <span className="text-sm font-medium text-gray-800">Edit</span>
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
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div className="mb-4 mt-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your name"
                                defaultValue={user.name}
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your email"
                                defaultValue={user.email}
                            />
                        </div>

                        {/* Username */}
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your username"
                                defaultValue={user.username}
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter new password"
                            />
                        </div>

                        {/* Bio */}
                        <div className="mb-4">
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Write your bio here..."
                                defaultValue={user.bio}
                            ></textarea>
                        </div>

                        {/* Save Button */}
                        <div className="text-right">
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: '#1D4ED8',
                                    color: '#FFFFFF',
                                    padding: '0.75rem 1.5rem',
                                    fontWeight: 'bold',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                    transition: 'background-color 0.15s ease-in-out',
                                    outline: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
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