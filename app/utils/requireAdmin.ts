import { redirect, LoaderFunction } from "@remix-run/node";
import { parse } from "cookie";

export const requireAdmin: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  if (!token) {
    throw redirect("/login");
  }

  // Fetch admin status from the backend
  const response = await fetch("http://localhost/api/user/is-admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw redirect("/login");
  }

  const data = await response.json();

  if (data.is_admin !== 1) {
    throw redirect("/");
  }

  return { token };
};