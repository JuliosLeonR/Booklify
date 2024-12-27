import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { parse } from "cookie";

import "./tailwind.css";

import { NotificationProvider, useNotification } from "~/context/NotificationContext";
import Navbar from "~/components/Navbar";
import { requireAuth } from "~/components/Auth";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

type LoaderData = {
  isAuthenticated: boolean;
  user: { profile_picture: string; name: string } | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  let user = null;
  if (token) {
    try {
      const authData = await requireAuth(request);
      user = authData.user;
      console.log("User data fetched:", user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  } else {
    console.log("No token found");
  }

  return json<LoaderData>({ isAuthenticated: !!token, user });
};

function Notification() {
  const { notification, setNotification } = useNotification();

  if (!notification) return null;

  return (
    <div className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 p-4 rounded ${notification.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
      {notification.message}
      <button onClick={() => setNotification(null)} className="ml-4">Close</button>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useLoaderData<LoaderData>();

  console.log("Loader data:", { isAuthenticated, user });

  return (
    <NotificationProvider>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          {isAuthenticated && user && <Navbar user={user} />}
          {children}
          <Notification />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </NotificationProvider>
  );
}

export default function App() {
  return <Outlet />;
}