import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { parse } from "cookie";

type LoaderData = {
    token: string | null;
};

export const loader: LoaderFunction = async ({ request }) => {
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token || null;

    return json<LoaderData>({ token });
};

export default function Token() {
    const { token } = useLoaderData<LoaderData>();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Token</h2>
                    <p className="text-gray-800 dark:text-gray-100">
                        {token ? `Token: ${token}` : "No token found"}
                    </p>
                </div>
            </div>
        </div>
    );
}