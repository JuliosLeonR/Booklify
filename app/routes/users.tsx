import { useLoaderData, Form, Link, useActionData } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { useNotification } from "~/context/NotificationContext";
import { useEffect } from "react";

type User = {
  id: number;
  profile_picture: string;
  name: string;
  username: string;
};

type LoaderData = {
  users: User[];
  currentUser: User;
};

type ActionData = {
  success?: string;
  errors?: { [key: string]: string };
};

export const loader: LoaderFunction = async ({ request }) => {
  const { token, user } = await requireAuth(request);
  const response = await fetch("http://localhost/api/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return json<LoaderData>({ users: data.users, currentUser: user });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const friendId = formData.get("friend_id");
  const userId = formData.get("user_id");

  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const response = await fetch("http://localhost/api/friends", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId, friend_id: friendId }),
  });

  if (!response.ok) {
    const errors = await response.json();
    return json({ errors }, { status: response.status });
  }

  return json({ success: "Friend request sent successfully" });
};

export default function Users() {
  const { users, currentUser } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { setNotification } = useNotification();

  useEffect(() => {
    if (actionData?.success) {
      setNotification({ message: actionData.success, type: "success" });
    } else if (actionData?.errors) {
      setNotification({ message: "Failed to send friend request", type: "error" });
    }
  }, [actionData, setNotification]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Users</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {users.map((user) => (
                <div key={user.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 flex flex-col items-center">
                <img src={`http://localhost/storage/${user.profile_picture}`} alt={user.name} className="max-w-full h-48 object-cover rounded-full" />
                <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{user.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">@{user.username}</p>
                <div className="mt-4 flex justify-between w-full">
                  <Link to={`/show-profile/${user.id}`} className="text-blue-500 hover:underline">View Profile</Link>
                  <Form method="post">
                  <input type="hidden" name="friend_id" value={user.id} />
                  <input type="hidden" name="user_id" value={currentUser.id} />
                  <button type="submit" className="text-green-500 hover:underline">Add Friend</button>
                  </Form>
                </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}