import { redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { parse } from "cookie";

export const action: ActionFunction = async ({ request }) => {
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    if (token) {
        await fetch("http://localhost/api/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    return redirect("/login", {
        headers: {
            "Set-Cookie": "token=; HttpOnly; Path=/; Max-Age=0",
        },
    });
};

export const loader = async () => {
    return redirect("/");
};

export default function Logout() {
    return null;
}