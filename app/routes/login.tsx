import { useState } from "react";
import { Form, useActionData, redirect } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const emailOrUsername = formData.get("email_or_username");
    const password = formData.get("password");

    const response = await fetch("http://localhost/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_or_username: emailOrUsername, password }),
    });

    if (!response.ok) {
        return { error: "Invalid credentials" };
    }

    const data = await response.json();
    const token = data.token;

    // Store the token in cookies
    return redirect("/dashboard", {
        headers: {
            "Set-Cookie": `token=${token}; HttpOnly; Path=/`,
        },
    });
};

export default function Login() {
    const actionData = useActionData();

    return (
        <div>
            <h1>Login</h1>
            <Form method="post">
                <div>
                    <label>
                        Email or Username:
                        <input type="text" name="email_or_username" required />
                    </label>
                </div>
                <div>
                    <label>
                        Password:
                        <input type="password" name="password" required />
                    </label>
                </div>
                {actionData?.error && <p>{actionData.error}</p>}
                <button type="submit">Login</button>
            </Form>
        </div>
    );
}