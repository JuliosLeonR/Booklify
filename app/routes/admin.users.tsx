import { useLoaderData, Link, Form, useFetcher } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState, useEffect } from "react";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { PencilSquareIcon, TrashIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import Modal from "~/components/Modal";
import { useNotification } from "~/context/NotificationContext";
import { requireAdmin } from "~/utils/requireAdmin";

type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  profile_picture: string;
  admin: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

type LoaderData = {
  users: User[];
  token: string;
  currentUser: User;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdmin({ request });

  const { user } = await requireAuth(request);
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const response = await fetch(`http://localhost/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return json<LoaderData>({ users: data.users, token, currentUser: user });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const userId = formData.get("userId");

  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  let response;
  if (actionType === "delete") {
    response = await fetch(`http://localhost/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else if (actionType === "promote") {
    response = await fetch(`http://localhost/api/admin/users/${userId}/promote`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else if (actionType === "update") {
    const name = formData.get("name");
    const email = formData.get("email");
    const username = formData.get("username");
    const admin = formData.get("admin") === "on";

    response = await fetch(`http://localhost/api/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, username, admin }),
    });
  }

  if (!response.ok) {
    return json({ error: "Action failed" }, { status: response.status });
  }

  return redirect("/admin/users");
};

export default function ManageUsers() {
  const { users, currentUser } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const { setNotification } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (fetcher.data?.error) {
      setNotification({ message: fetcher.data.error, type: "error" });
    } else if (fetcher.state === "idle" && fetcher.data) {
      setNotification({ message: "Action completed successfully", type: "success" });
    }
  }, [fetcher, setNotification]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleDeleteClick = (userId: number) => {
    fetcher.submit({ actionType: "delete", userId: userId.toString() }, { method: "post" });
  };

  const handlePromoteClick = (userId: number) => {
    fetcher.submit({ actionType: "promote", userId: userId.toString() }, { method: "post" });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Manage Users</h1>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Profile</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Username</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Role</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      <img src={`http://localhost/storage/${user.profile_picture}`} alt={user.username} className="w-10 h-10 rounded-full" />
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{user.name}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{user.email}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{user.username}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{user.admin ? "Admin" : "User"}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      <div className="flex items-center justify-center space-x-2">
                        {user.id !== currentUser.id && (
                          <>
                            <button onClick={() => handleEditClick(user)} className="text-blue-500 hover:underline">
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handlePromoteClick(user.id)} className="text-green-500 hover:underline">
                              <ArrowUpIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteClick(user.id)} className="text-red-500 hover:underline">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <Modal show={showModal} onClose={handleModalClose} title="Edit User">
          <Form method="post" action={`/admin/users/${selectedUser.id}`}>
            <input type="hidden" name="actionType" value="update" />
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input type="text" name="name" id="name" defaultValue={selectedUser.name} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" name="email" id="email" defaultValue={selectedUser.email} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
            </div>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input type="text" name="username" id="username" defaultValue={selectedUser.username} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
            </div>
            <div className="mb-4">
              <label htmlFor="admin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin</label>
              <input type="checkbox" name="admin" id="admin" defaultChecked={selectedUser.admin} className="mt-1 block" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
}