import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { parse } from "cookie";
import { requireAuth } from "~/components/Auth";
import Recommendations from "~/components/Recommendations";

type LoaderData = {
    token: string;
};

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await requireAuth(request);

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.token;

    return json<LoaderData>({ token });
};

export default function ForYou() {
    const { token } = useLoaderData<LoaderData>();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10 mt-4">
            <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 sm:p-10">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">For You</h2>
                    <p className="text-center text-gray-800 dark:text-gray-100 font-bold mb-6">Discover books recommended just for you!</p>
                    <Recommendations token={token} />
                </div>
            </div>
        </div>
    );
}