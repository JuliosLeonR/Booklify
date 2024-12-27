import { redirect } from "@remix-run/node";
import { parse } from "cookie";

export async function requireAuth(request: Request) {
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    if (!token) {
        throw redirect("/login");
    }

    // Fetch user data from the backend
    const response = await fetch("http://localhost/api/user", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw redirect("/login");
    }

    const user = await response.json();
    return { token, user };
}