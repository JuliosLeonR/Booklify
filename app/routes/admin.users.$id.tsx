import { useLoaderData, Form, redirect } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";

type User = {
  id: number;
  name: string;
  email: string;
  admin: boolean;
};

type LoaderData = {
  user: User;
  token: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user } = await requireAuth(request);
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const response = await fetch(`http://localhost/api/admin/users/${params.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  const data = await response.json();
  return json<LoaderData>({ user: data.user, token });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const admin = formData.get("admin") === "true";

  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const response = await fetch(`http://localhost/api/admin/users/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email, admin }),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return redirect("/admin/users");
};

export default function EditUser() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div>
      <h1>Edit User</h1>
      <Form method="post">
        <label>
          Name:
          <input type="text" name="name" defaultValue={user.name} />
        </label>
        <label>
          Email:
          <input type="email" name="email" defaultValue={user.email} />
        </label>
        <label>
          Admin:
          <input type="checkbox" name="admin" defaultChecked={user.admin} />
        </label>
        <button type="submit">Save</button>
      </Form>
    </div>
  );
}