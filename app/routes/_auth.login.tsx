//import { useState } from "react";
import { Form, useActionData, redirect, useNavigation, Link } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { useNotification } from "~/context/NotificationContext";
import { useEffect } from "react";

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
  const { setNotification } = useNotification();
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === "submitting") {
      setNotification({ message: "Logging in...", type: "success" });
    } else if (navigation.state === "idle" && actionData?.error) {
      setNotification({ message: actionData.error, type: "error" });
    }
  }, [navigation.state, actionData, setNotification]);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Sign in to your account
          </h1>
          <Form method="post" className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="email_or_username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Email or Username
              </label>
              <input
                type="text"
                name="email_or_username"
                id="email_or_username"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="name@example.com or username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    aria-describedby="remember"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
              </div>
              <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Sign in
            </button>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              <Link to="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</Link>
            </p>
          </Form>
        </div>
      </div>
    </section>
  );
}